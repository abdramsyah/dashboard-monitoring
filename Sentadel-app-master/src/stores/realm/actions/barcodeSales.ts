import RealmCtx from '@sentadell-src/database/realm';
import {
  BarcodeSalesDaily,
  BarcodeSalesR,
  ClientBarcodeSalesR
} from '../schemas/barcodeSales';
import uuid from 'react-native-uuid';
import { LOG } from '@sentadell-src/utils/commons';
import { GetRealmBaseProps } from '@sentadell-src/types/global';
import { useState } from 'react';
import { getSalesBarcode } from '@sentadell-src/apis/queries/fetch';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import dayjs from 'dayjs';
import { showMessage } from 'react-native-flash-message';

export const useRefreshingBarcodeSales = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      await getSalesBarcode({ mode: 'GRADING' }).then(fetch => {
        storage.set(
          STORAGE_KEYS.BARCODE_SALES_DAILY_REFETCH,
          dayjs().locale('id').format()
        );

        const data = fetch.data.data;

        const newData = () => {
          const clientDummies: ClientBarcodeSalesR[] = [];

          if (data?.length) {
            data.forEach(dummy => {
              let codesDummies: BarcodeSalesR[] = [];

              if (dummy?.code_data) {
                dummy?.code_data.forEach(codeData => {
                  if (codeData.codes) {
                    codesDummies = [...codesDummies, ...codeData.codes];
                  }
                });
              }
              const clientDummy = {
                client_id: dummy.client_id,
                client_code: dummy.client_code,
                client_name: dummy.client_name,
                codes: codesDummies
              } as ClientBarcodeSalesR;

              // LOG.info('refreshingBarcodeSales - clientDummy', clientDummy);

              clientDummies.push(clientDummy);
            });
          } else {
            throw 'Response barcode sales kosong';
          }

          return clientDummies;
        };

        if (newData().length) {
          const id = uuid.v4();

          realm.write(() => {
            realm.create<BarcodeSalesDaily>('BarcodeSalesDaily', {
              _id: id.toString(),
              list: newData()
            });
          });
        }
      });
      setIsSuccess(true);
    } catch (err) {
      LOG.error('useRefreshingBarcodeSales - err', err);
      showMessage({
        type: 'danger',
        message: 'Gagal, terjadi kesalahan! ' + err
      });
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    isSuccess,
    refresh
  };
};

interface UseGetLatestStoredBarcodeSalesProps extends GetRealmBaseProps {
  status?: BarcodeSalesR['status'];
}

export const useGetLatestStoredBarcodeSales = (
  props: UseGetLatestStoredBarcodeSalesProps
) => {
  const { from, limit, status } = props;
  const barcodeSalesDaily =
    RealmCtx.useQuery<BarcodeSalesDaily>('BarcodeSalesDaily');

  const lastData = barcodeSalesDaily[barcodeSalesDaily.length - 1];

  const clientDummy: ClientBarcodeSalesR[] = [];

  if (lastData) {
    if (from && from >= 0 && typeof limit !== 'undefined' && limit >= 0) {
      if (status) {
        lastData?.list?.forEach(client => {
          const codesDummy: BarcodeSalesR[] = [];

          client.codes?.slice(from - 1).every(e => {
            if (codesDummy.length === limit) return false;
            if (e.status === status) {
              codesDummy.push(e);
              return true;
            }
          });

          clientDummy.push({
            client_id: client.client_id,
            client_code: client.client_code,
            client_name: client.client_name,
            codes: codesDummy
          } as ClientBarcodeSalesR);
        });
      } else {
        lastData?.list?.forEach(client => {
          clientDummy.push({
            client_id: client.client_id,
            client_code: client.client_code,
            client_name: client.client_name,
            codes: client.codes?.slice(from - 1, limit) || []
          } as ClientBarcodeSalesR);
        }) || [];
      }
    } else if (typeof limit !== 'undefined' && limit >= 0 && !from) {
      if (status) {
        lastData?.list?.forEach(client => {
          const codesDummy: BarcodeSalesR[] = [];

          client.codes?.every(e => {
            if (codesDummy.length === limit) return false;
            if (e.status === status) {
              codesDummy.push(e);
              return true;
            }
            return true;
          });

          clientDummy.push({
            client_id: client.client_id,
            client_code: client.client_code,
            client_name: client.client_name,
            codes: codesDummy
          } as ClientBarcodeSalesR);
        });
      } else {
        lastData?.list?.forEach(client => {
          clientDummy.push({
            client_id: client.client_id,
            client_code: client.client_code,
            client_name: client.client_name,
            codes: client.codes?.slice(0, limit) || []
          } as ClientBarcodeSalesR);
        }) || [];
      }
    } else if (from && from >= 0 && typeof limit === 'undefined') {
      if (status) {
        lastData?.list?.forEach(client => {
          const codesDummy: BarcodeSalesR[] = [];

          client.codes?.slice(from - 1).every(e => {
            if (e.status === status) {
              codesDummy.push(e);
              return true;
            }
            return true;
          });

          clientDummy.push({
            client_id: client.client_id,
            codes: codesDummy
          } as ClientBarcodeSalesR);
        });
      } else {
        lastData?.list?.forEach(client => {
          clientDummy.push({
            client_id: client.client_id,
            client_code: client.client_code,
            client_name: client.client_name,
            codes: client.codes?.slice(from - 1) || []
          } as ClientBarcodeSalesR);
        }) || [];
      }
    }

    return {
      _id: lastData?._id,
      list: clientDummy,
      timestamp: lastData.timestamp
    } as BarcodeSalesDaily;
  }

  return {
    _id: '',
    list: clientDummy,
    timestamp: 0
  } as BarcodeSalesDaily;
};

type useChangeBarcodeSalesStatusProps = {
  clientId: number;
  data: BarcodeSalesR[];
  status: BarcodeSalesR['status'];
};

export const useChangeBarcodeSalesStatus = (objId: string) => {
  const realm = RealmCtx.useRealm();
  const obj = RealmCtx.useObject<BarcodeSalesDaily>('BarcodeSalesDaily', objId);

  return (props: useChangeBarcodeSalesStatusProps) => {
    const { clientId, data, status } = props;

    if (obj) {
      LOG.warn('changeBarcodeSalesStatus - isObj Exist');
      const dataIdx: { clientIdx: number; codeIdx: number }[] = [];

      data.forEach(d => {
        obj.list?.every((client, idx) => {
          if (client.client_id === clientId) {
            client.codes?.every((code, codeIdx) => {
              if (code.code === d.code) {
                dataIdx.push({ clientIdx: idx, codeIdx });

                return false;
              }

              return true;
            });

            return false;
          }

          return true;
        });
      });

      realm.write(() => {
        dataIdx.forEach(dIdx => {
          if (obj.list) {
            obj.list[dIdx.clientIdx].codes[dIdx.codeIdx].status = status;
          }
        });
      });
    }
  };
};
