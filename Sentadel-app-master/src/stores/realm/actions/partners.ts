import RealmCtx from '@sentadell-src/database/realm';
import { GetRealmBaseProps } from '@sentadell-src/types/global';
import { PartnerModelR } from '../schemas/partners';
import { useMemo, useState } from 'react';
import { LOG } from '@sentadell-src/utils/commons';
import { showMessage } from 'react-native-flash-message';
import { getPartners } from '@sentadell-src/apis/queries/fetch';
import { storage, STORAGE_KEYS } from '@sentadell-src/database/mmkv';
import { DecodedTokenType } from '@sentadell-src/types/auth';
import { PartnerModel } from '@sentadell-src/types/partner';
import { DropdownItemProps } from '@sentadell-src/components/Dropdown/Dropdown';

interface UseGetPartnersProps extends GetRealmBaseProps {
  isReversed?: boolean;
}

export const useGetPartners = (props: UseGetPartnersProps) => {
  const { from, limit, isReversed } = props;
  let partners = RealmCtx.useQuery<PartnerModelR>('PartnerModelR');

  if (isReversed) {
    partners = partners.sorted('partner_name', true);
  }

  const mapDropdown: DropdownItemProps[] = partners.map(e => ({
    value: e.partner_id,
    label: e.partner_name,
    selected: false,
    data: e
  }));

  return {
    data: partners.slice(from ? from - 1 : 0, limit),
    dropdown: mapDropdown
  };
};

export const useCreatePartners = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<
    { type?: string; message?: string } | string
  >({});
  const allPartner = RealmCtx.useQuery<PartnerModelR>('PartnerModelR');

  const decodedToken = useMemo(() => {
    const storageString = storage.getString(STORAGE_KEYS.DECODED_TOKEN);

    if (storageString) return JSON.parse(storageString) as DecodedTokenType;
  }, []);

  const create = async (onSuccess?: (val: PartnerModel[]) => void) => {
    setIsLoading(true);
    try {
      let data: PartnerModel[] = [];

      realm.write(() => {
        realm.delete(allPartner);
      });

      await getPartners({
        'filter[0]': `coordinator_user_id:${decodedToken?.userId}`
      }).then(res => {
        data = res.data.data;

        if (data?.length) {
          realm.write(() => {
            data.forEach(e => {
              realm.create<PartnerModelR>('PartnerModelR', e);
            });
          });
        } else {
          throw {
            type: 'empty',
            message: 'Response dari table mitra kosong'
          };
        }
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      LOG.error('useCreatePartners - err', err);
      setError(err);
      showMessage({
        type: 'danger',
        message: 'Gagal, terjadi kesalahan! ' + (err?.message || err)
      });
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    isSuccess,
    error,
    create
  };
};
