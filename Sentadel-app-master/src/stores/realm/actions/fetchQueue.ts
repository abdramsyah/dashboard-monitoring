import RealmCtx from '@sentadell-src/database/realm';
import Realm from 'realm';
import { GetRealmBaseProps } from '@sentadell-src/types/global';
import uuid from 'react-native-uuid';
import { LOG } from '@sentadell-src/utils/commons';
import { showMessage } from 'react-native-flash-message';
import { useState } from 'react';
import {
  createGradeInformation,
  createGrouping,
  updateGradeInformation
} from '@sentadell-src/apis/queries/fetch';
import { GradingQueueResModel } from '@sentadell-src/types/grading';
import { FetchQueue, FetchQueueStatus } from '../schemas/fetchQueue';
import { GradingQueueData } from '../schemas/grading';
import { GroupingQueueData } from '../schemas/grouping';
import { GoodsDataForGroupingParams } from '@sentadell-src/types/grouping';
import { ShipmentQueueData } from '../schemas/shipment';

const showErrorMessage = (err: unknown) => {
  LOG.error('showErrorMessage - err', err);
  showMessage({
    type: 'danger',
    message: 'Gagal, terjadi kesalahan! ' + err
  });
};

interface UseGetFetchQueuesProps extends GetRealmBaseProps {
  filter?: FilterProps;
  keyword?: string;
  isReversed?: boolean;
}

type FilterProps = {
  status?: FetchQueue['status'] | FetchQueue['status'][];
  type?: FetchQueue['type'] | FetchQueue['type'][];
};

export const useGetFetchQueues = (props: UseGetFetchQueuesProps) => {
  const { from, limit, filter, isReversed } = props;
  let fetchQueue = RealmCtx.useQuery<FetchQueue>(
    'FetchQueue',
    trx => {
      if (filter) {
        const filterQueryArr: string[] = [];
        const filterValueArr: unknown[] = [];

        Object.keys(filter).map((key, idx) => {
          const newKey = key as keyof FilterProps;
          const filterValue = filter[newKey];

          if (filterValue) {
            filterQueryArr.push(
              `${key} ${filterValue instanceof Array ? 'IN ' : '= '} $${idx}`
            );
            filterValueArr.push(filterValue);
          }
        });

        const filterQuery = filterQueryArr.join(' AND ');

        return trx.filtered(filterQuery, ...filterValueArr);
      }
      return trx;
    },
    [filter]
  );

  if (isReversed) {
    fetchQueue = fetchQueue.sorted('trx_timestamp', true);
  }

  return fetchQueue.slice(from ? from - 1 : 0, limit);
};

type CreateFetchQueueType =
  | {
      type: 'GRADING' | 'GRADING_UPDATE';
      status: FetchQueueStatus;
      data: GradingQueueData[];
      onSuccess?: (fetchQueue?: FetchQueue) => void;
    }
  | {
      type: 'GROUPING';
      status: FetchQueueStatus;
      data: GroupingQueueData;
      onSuccess?: (fetchQueue?: FetchQueue) => void;
    }
  | {
      type: 'SHIPMENT';
      status: FetchQueueStatus;
      data: ShipmentQueueData;
      onSuccess?: (fetchQueue?: FetchQueue) => void;
    };

export const useCreateFetchQueue = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const create = async (props: CreateFetchQueueType) => {
    const { type, status, data, onSuccess } = props;

    LOG.info('useCreateFetchQueue - create - data', data);
    setIsLoading(true);
    try {
      let fetchQueue: FetchQueue | undefined = undefined;

      if (data) {
        const trxQueueId = uuid.v4();

        realm.write(() => {
          if (type === 'GRADING' || type === 'GRADING_UPDATE') {
            fetchQueue = realm.create<FetchQueue>('FetchQueue', {
              _id: trxQueueId.toString(),
              type: type,
              gradingData: data,
              status
            });
          }

          if (type === 'GROUPING') {
            data._id = new Realm.BSON.UUID().toString();
            fetchQueue = realm.create<FetchQueue>('FetchQueue', {
              _id: trxQueueId.toString(),
              type: type,
              groupingData: data,
              status
            });
          }

          if (type === 'SHIPMENT') {
            data._id = new Realm.BSON.UUID().toString();
            fetchQueue = realm.create<FetchQueue>('FetchQueue', {
              _id: trxQueueId.toString(),
              type: type,
              shipmentData: data,
              status
            });
          }
        });
      }
      setIsSuccess(true);
      if (onSuccess) onSuccess(fetchQueue);
    } catch (err) {
      showErrorMessage(err);
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    isSuccess,
    create
  };
};

type ChangeQueueStatusProps =
  | {
      obj: FetchQueue;
      status: 'PAUSED' | 'QUEUED' | 'ON_PROGRESS';
    }
  | {
      obj: FetchQueue;
      status: 'COMPLETED';
      gradingData?: GradingQueueResModel[];
      groupingData?: GroupingQueueData;
    };

type FetchingQueueProps = {
  obj: FetchQueue;
  onFinish?: () => void;
};

export const useManageFetchQueue = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  // const [fetchSuccess, setFetchSuccess] = useState(false);

  const change = (props: ChangeQueueStatusProps) => {
    const { obj, status } = props;

    setIsLoading(true);

    try {
      if (obj) {
        if (obj.type === 'GRADING' || obj.type === 'GRADING_UPDATE') {
          realm.write(() => {
            if (obj.gradingData) {
              if (status !== 'COMPLETED') {
                obj.status = status;
              } else {
                const { gradingData: data } = props;

                obj.status = status;
                const objData = obj.gradingData;

                LOG.info('change', props);

                if (objData && data) {
                  data.forEach(e => {
                    if (e.index > -1) {
                      const objDataIndex = objData[e.index];

                      objData[e.index].status = e.status;
                      objData[e.index].message = e.message;

                      if (objDataIndex.sales_code_data) {
                        if (e.status === 'UPDATED' && !e.withBarcode) {
                          objDataIndex.sales_code_data.status = 'free';
                        } else {
                          objDataIndex.sales_code_data.status = [
                            'SUCCESS',
                            'UPDATED'
                          ].includes(e.status)
                            ? 'used'
                            : 'free';
                        }
                      }

                      if (e.reference_data)
                        objData[e.index].reference_data = e.reference_data;
                    }
                  });
                }
              }
            }
          });
        } else if (obj.type === 'GROUPING') {
          realm.write(() => {
            if (obj.groupingData) {
              if (status !== 'COMPLETED') {
                obj.status = status;
              } else {
                const { groupingData: data } = props;

                LOG.info('change', props);
                obj.status = status;
                if (obj.groupingData && data) {
                  obj.groupingData.grouping_id = data.grouping_id;
                  obj.groupingData.grouping_number = data.grouping_number;
                  obj.groupingData.grouping_client_number =
                    data.grouping_client_number;
                  obj.groupingData.grouping_list = data.grouping_list;
                }
              }
            }
          });
        }
      } else {
        throw 'Antrian grading tidak ditemukan';
      }
      setIsSuccess(true);
    } catch (err) {
      showErrorMessage(err);
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  const fetch = async (props: FetchingQueueProps) => {
    const { obj, onFinish } = props;

    setFetchLoading(true);

    change({ obj, status: 'ON_PROGRESS' });
    if (obj.type === 'GRADING') {
      try {
        if (obj.gradingData) {
          await createGradeInformation(obj.gradingData).then(res => {
            LOG.error('fetch - res', res.data.data);
            if (res?.data?.data) {
              change({ obj, status: 'COMPLETED', gradingData: res.data.data });
            } else {
              throw 'Response null';
            }
          });
        } else {
          throw 'Data barang kosong';
        }
      } catch (err) {
        change({ obj, status: 'PAUSED' });
        showErrorMessage(err);
      }
      setFetchLoading(false);
      if (onFinish) onFinish();
    } else if (obj.type === 'GRADING_UPDATE') {
      try {
        if (obj.gradingData) {
          await updateGradeInformation(obj.gradingData).then(res => {
            LOG.info('fetch - res', res.data.data);
            if (res?.data?.data) {
              change({ obj, status: 'COMPLETED', gradingData: res.data.data });
            } else {
              throw 'Response null';
            }
          });
        } else {
          throw 'Data barang kosong';
        }
      } catch (err) {
        change({ obj, status: 'PAUSED' });
        showErrorMessage(err);
      }
      setFetchLoading(false);
      if (onFinish) onFinish();
    } else if (obj.type === 'GROUPING') {
      try {
        if (obj.gradingData) {
          const params: GoodsDataForGroupingParams[] =
            obj.groupingData?.grouping_list?.map(e => ({
              index: e.index || 0,
              serial_number_or_code: e.serial_number || e.sales_code || '',
              djarum_grade: e.djarum_grade || ''
            })) || [];

          await createGrouping(params).then(res => {
            LOG.info('fetch - res', res.data.data);
            if (res?.data?.data) {
              change({ obj, status: 'COMPLETED', groupingData: res.data.data });
            } else {
              throw 'Response null';
            }
          });
        } else {
          throw 'Data barang kosong';
        }
      } catch (err) {
        change({ obj, status: 'PAUSED' });
        showErrorMessage(err);
      }
      setFetchLoading(false);
      if (onFinish) onFinish();
    }
  };

  return {
    isLoading,
    isSuccess,
    change,
    fetchLoading,
    fetch
  };
};

export const useResetGradingQueue = () => {
  const realm = RealmCtx.useRealm();
  const allGradingQueue = RealmCtx.useQuery<FetchQueue>('FetchQueue');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reset = () => {
    setIsLoading(true);
    try {
      realm.write(() => {
        realm.delete(allGradingQueue);
      });
      setIsSuccess(true);
    } catch (err) {
      showErrorMessage(err);
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  return {
    reset,
    isLoading,
    isSuccess
  };
};
