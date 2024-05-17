import React, { useCallback, useEffect, useState } from 'react';
import DrawerNavigation from './navigation/DrawerNavigation';
import {
  useGetFetchQueues,
  useManageFetchQueue
} from './stores/realm/actions/fetchQueue';
import { useSelector } from 'react-redux';
import { RootState } from './database/reduxStore';
import { LOG } from './utils/commons';

const AppWrapper = () => {
  const fetchQueue = useGetFetchQueues({
    filter: { status: ['QUEUED', 'ON_PROGRESS'] }
  });
  const manageQueue = useManageFetchQueue();
  const { isAuth, isStartUp } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);

  const fetching = useCallback(async () => {
    if (fetchQueue?.length && !loading) {
      setLoading(true);
      await manageQueue.fetch({
        obj: fetchQueue[0],
        onFinish: () => {
          setLoading(false);
        }
      });
    }
  }, [manageQueue, fetchQueue, isAuth, isStartUp]);

  useEffect(() => {
    LOG.warn('fetching', isAuth, isStartUp);
    if (isAuth && !isStartUp) {
      fetching();
    }
  }, [manageQueue, fetchQueue, isAuth, isStartUp]);

  return <DrawerNavigation />;
};

export default AppWrapper;
