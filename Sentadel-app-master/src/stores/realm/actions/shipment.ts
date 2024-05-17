import RealmCtx from '@sentadell-src/database/realm';
import { LOG } from '@sentadell-src/utils/commons';
import { useState } from 'react';
import { showMessage } from 'react-native-flash-message';
import { GroupingQueueData } from '../schemas/grouping';
import { ShipmentQueueData } from '../schemas/shipment';
import { getGroupingList } from '@sentadell-src/apis/queries/fetch';

const showErrorMessage = (err: unknown) => {
  LOG.error('useManageGroupingData - err', err);
  showMessage({
    type: 'danger',
    message: 'Gagal, terjadi kesalahan! ' + err
  });
};

export const useManageShipmentData = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const add = (obj: ShipmentQueueData, data: GroupingQueueData) => {
    setIsLoading(true);
    try {
      if (obj) {
        realm.write(() => {
          const currentList = obj.grouping_data_list;

          currentList?.push(data);
          obj.grouping_data_list = currentList;
        });

        if (
          obj.grouping_data_list?.length &&
          (obj.grouping_data_list?.length % 5 === 0 ||
            obj.grouping_data_list.length === 1)
        ) {
          sync(obj);
        }
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

  const remove = (obj: ShipmentQueueData, data: GroupingQueueData) => {
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

  const sync = async (obj: ShipmentQueueData, onFinish?: () => void) => {
    setSyncLoading(true);

    if (obj) {
      try {
        if (obj.shipment_type === 'GROUPING') {
          if (obj.grouping_data_list?.length) {
            await getGroupingList({
              'filter[0]': obj.grouping_data_list
                .map(e => e.grouping_number)
                .join(',')
            }).then(res => {
              LOG.info('sync - res', res.data.data);
              if (res?.data?.data) {
                realm.write(() => {
                  obj.grouping_data_list = res.data.data.map(e => ({
                    grouping_id: e.grouping_id
                  })) as GroupingQueueData[];
                });
              } else {
                throw 'Response null';
              }
            });
          } else {
            throw 'Data barang kosong';
          }
        } else if (obj.client_code === 'DJRM') {
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
