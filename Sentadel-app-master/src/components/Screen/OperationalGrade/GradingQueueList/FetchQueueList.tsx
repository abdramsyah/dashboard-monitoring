import { ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useCallback } from 'react';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import styles from './FetchQueueList.style';
import GradingQueueCard from '../GradingQueueCard/GradingQueueCard';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import { routes } from '@sentadell-src/navigation/RootNavigationParams';
import { CommonActions, useNavigation } from '@react-navigation/native';
import GroupingQueueCard from '../../OperationalGrouping/GroupingQueueCard/GroupingQueueCard';
import ShipmentQueueCard from '../../OperationalShipment/ShipmentQueueCard/ShipmentQueueCard';

interface FetchQueueListProps {
  fetchQueue: (FetchQueue & Realm.Object<FetchQueue>)[];
  onPressItem: (
    queue: FetchQueue & Realm.Object<FetchQueue>,
    idx: number
  ) => void;
  customHeight?: number;
}

const FetchQueueList: React.FC<FetchQueueListProps> = (
  props: FetchQueueListProps
) => {
  const { fetchQueue, onPressItem, customHeight } = props;

  const navigation = useNavigation();

  const renderCard = useCallback(
    (queue: FetchQueue & Realm.Object<FetchQueue>, idx: number) => {
      if (queue.type === 'SHIPMENT')
        return (
          <ShipmentQueueCard
            key={idx.toString()}
            queue={queue}
            onPressItem={onPressItem}
            idx={idx}
          />
        );

      if (queue.type === 'GROUPING')
        return (
          <GroupingQueueCard
            key={idx.toString()}
            queue={queue}
            onPressItem={onPressItem}
            idx={idx}
          />
        );

      return (
        <GradingQueueCard
          key={idx.toString()}
          queue={queue}
          onPressItem={onPressItem}
          idx={idx}
        />
      );
    },
    []
  );

  return (
    <View
      style={[
        {
          alignItems: 'flex-end',
          paddingTop: 4,
          height: customHeight
        }
      ]}>
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(
            CommonActions.navigate({ name: routes.OPERATIONAL_FETCH_QUEUE })
          );
        }}>
        <TextBase.S
          style={{
            color: Colors.text.black,
            fontWeight: '700',
            paddingHorizontal: 8
          }}>
          Lihat Semua
        </TextBase.S>
      </TouchableOpacity>
      <ScrollView horizontal style={[styles.gradingQueueScroll]}>
        {fetchQueue.map(renderCard)}
      </ScrollView>
    </View>
  );
};

export default FetchQueueList;
