import RealmCtx from '@sentadell-src/database/realm';
import { useState } from 'react';
import { GradeStorage, GradeStorageModel } from '../schemas/grades';
import uuid from 'react-native-uuid';
import { LOG } from '@sentadell-src/utils/commons';
import { showMessage } from 'react-native-flash-message';
import { GetRealmBaseProps } from '@sentadell-src/types/global';
import { getAllGrade } from '@sentadell-src/apis/queries/fetch';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import dayjs from 'dayjs';

interface UseGetGradesStorageProps extends GetRealmBaseProps {
  clientId?: number;
}

export const useGetGradesStorage = (props: UseGetGradesStorageProps) => {
  const { from, limit, clientId } = props;
  const gradesStorage = RealmCtx.useQuery<GradeStorage>(
    'GradeStorage',
    grades => {
      if (clientId) {
        return grades.filtered('grades.client_id = $0', clientId);
      }
      return grades;
    }
  );

  const lastData = gradesStorage[gradesStorage.length - 1];

  lastData?.grades?.slice(from ? from - 1 : 0, limit);

  return lastData;
};

export const useCreateGradesStorage = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const create = async () => {
    setIsLoading(true);
    try {
      await getAllGrade().then(fetch => {
        storage.set(
          STORAGE_KEYS.GRADES_DAILY_REFETCH,
          dayjs().locale('id').format()
        );

        const data = fetch.data.data;

        LOG.info('useCreateGradesStorage - create - data', data);

        if (data.length) {
          realm.write(() => {
            const storedId = uuid.v4();
            const grades = data.map(
              e =>
                ({
                  model_id: e.model_id,
                  id: e.id,
                  grade: e.grade,
                  price: e.price,
                  quota: e.quota,
                  client_id: e.client_id,
                  client_sales_code_initial: e.client_sales_code_initial,
                  client_code: e.client_code,
                  client_name: e.client_name,
                  ub: e.ub
                } as GradeStorageModel)
            );

            LOG.info('useCreateGradesStorage - data', data);
            realm.create<GradeStorage>('GradeStorage', {
              _id: storedId.toString(),
              grades
            });
          });
        } else {
          throw 'Response grades kosong';
        }
      });
      setIsSuccess(true);
    } catch (err) {
      LOG.error('useCreateGradingQueue - err', err);
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
    create
  };
};
