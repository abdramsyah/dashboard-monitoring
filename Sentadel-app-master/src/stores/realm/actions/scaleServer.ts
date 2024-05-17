import RealmCtx from '@sentadell-src/database/realm';
import { ScaleServer, ScaleServerType } from '../schemas/scaleServer';
import { useState } from 'react';
import { showMessage } from 'react-native-flash-message';

export const useGetScaleServer = () => {
  const scaleServers = RealmCtx.useQuery<ScaleServer>('ScaleServer');

  if (scaleServers?.length) return scaleServers[scaleServers.length - 1];
};

interface UpdateScaleServerProps {
  data: ScaleServerType;
  obj: ScaleServer;
  onSuccess?: () => void;
}

export const useSetScaleServer = () => {
  const realm = RealmCtx.useRealm();
  const [isLoading, setIsLoading] = useState(false);

  const create = (data: ScaleServerType, onSuccess?: () => void) => {
    setIsLoading(true);
    try {
      realm.write(() => {
        realm.create<ScaleServer>('ScaleServer', data);
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      showMessage({
        type: 'danger',
        message: 'Gagal, terjadi kesalahan! ' + err
      });
    }
    setIsLoading(false);
  };

  const update = ({ data, obj, onSuccess }: UpdateScaleServerProps) => {
    setIsLoading(true);
    try {
      realm.write(() => {
        if (data.host) obj.host = data.host;
        if (data.portGroup) obj.portGroup = data.portGroup;
        if (data.portList) obj.portList = data.portList;
        if (data.currPortIdx + 1) obj.currPortIdx = data.currPortIdx;
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      showMessage({
        type: 'danger',
        message: 'Gagal, terjadi kesalahan! ' + err
      });
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    create,
    update
  };
};
