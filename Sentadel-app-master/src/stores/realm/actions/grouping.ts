import RealmCtx from '@sentadell-src/database/realm';
import { LOG } from '@sentadell-src/utils/commons';
import { useState } from 'react';
import { showMessage } from 'react-native-flash-message';
import { GropuingQueueGoodsData, GroupingQueueData } from '../schemas/grouping';
import { getGoodsListForGrouping } from '@sentadell-src/apis/queries/fetch';

const showErrorMessage = (err: unknown) => {
  LOG.error('useManageGroupingData - err', err);
  showMessage({
    type: 'danger',
    message: 'Gagal, terjadi kesalahan! ' + err
  });
};

export const useManageGroupingData = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const add = (
    obj: GroupingQueueData,
    data: GropuingQueueGoodsData,
    onSuccess?: (data: GroupingQueueData) => void
  ) => {
    setIsLoading(true);
    try {
      if (obj) {
        realm.write(() => {
          const currentList = obj.grouping_list;

          currentList?.push(data);
          obj.grouping_list = currentList;
        });

        if (
          obj.grouping_list?.length &&
          (obj.grouping_list?.length % 5 === 0 ||
            (obj.grouping_list.length === 1 && !obj.grouping_list[0].grade))
        ) {
          sync(obj);
        }
      } else {
        throw 'Data gulungan tidak ditemukan';
      }
      if (onSuccess) onSuccess(obj);
    } catch (err) {
      showErrorMessage(err);
    }
    setIsLoading(false);
  };

  const remove = (obj: GroupingQueueData, data: GropuingQueueGoodsData) => {
    setIsLoading(true);
    try {
      if (obj) {
        realm.write(() => realm.delete(data));
      } else {
        throw 'Data gulungan tidak ditemukan';
      }
      setIsSuccess(true);
    } catch (err) {
      showErrorMessage(err);
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  const sync = async (obj: GroupingQueueData, onFinish?: () => void) => {
    setSyncLoading(true);

    if (obj) {
      try {
        if (obj.grouping_list?.length) {
          await getGoodsListForGrouping(
            obj.grouping_list.map((e, index) => ({
              index,
              serial_number_or_code: e.serial_number || e.sales_code || '',
              djarum_grade: e.djarum_grade || ''
            }))
          ).then(res => {
            LOG.info('sync - res', res.data.data);
            if (res?.data?.data) {
              realm.write(() => {
                obj.grouping_list = res.data.data as GropuingQueueGoodsData[];
              });
            } else {
              throw 'Response null';
            }
          });
        } else {
          throw 'Data barang kosong';
        }
      } catch (err) {
        LOG.info('useManageGroupingData - sync - err', err);
        showErrorMessage(err);
      }
      setSyncLoading(false);
      if (onFinish) onFinish();
    }
  };

  return {
    isLoading,
    isSuccess,
    add,
    remove,
    syncLoading,
    sync
  };
};
