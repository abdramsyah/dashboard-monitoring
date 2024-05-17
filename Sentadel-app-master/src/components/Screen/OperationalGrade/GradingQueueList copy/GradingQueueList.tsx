import { ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useCallback } from 'react';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import styles from './GradingQueueList.style';
import GradingQueueCard from '../GradingQueueCard/GradingQueueCard';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import { routes } from '@sentadell-src/navigation/RootNavigationParams';
import { CommonActions, useNavigation } from '@react-navigation/native';

interface GradingQueueListProps {
  fetchQueue: (FetchQueue & Realm.Object<FetchQueue>)[];
  onPressItem: (
    queue: FetchQueue & Realm.Object<FetchQueue>,
    idx: number
  ) => void;
}

const GradingQueueList = (props: GradingQueueListProps) => {
  const { fetchQueue, onPressItem } = props;

  const navigation = useNavigation();

  const renderCard = useCallback(
    (queue: FetchQueue & Realm.Object<FetchQueue>, idx: number) => {
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
      style={{
        alignItems: 'flex-end',
        paddingTop: 4
      }}>
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
      <ScrollView horizontal style={styles.gradingQueueScroll}>
        {fetchQueue.map(renderCard)}
      </ScrollView>
    </View>
  );
};

export default GradingQueueList;
