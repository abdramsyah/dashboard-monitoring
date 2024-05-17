import { View, FlatList } from 'react-native';
import React, { useCallback, useState } from 'react';
import {
  useCreateFetchQueue,
  useGetFetchQueues
} from '@sentadell-src/stores/realm/actions/fetchQueue';
import GradingQueueDetailModal, {
  GradingQueueDetailModalProps
} from '@sentadell-src/components/Screen/OperationalGrade/GradingQueueDetailModal/GradingQueueDetailModal';
import Base from '@sentadell-src/components/Base/Base';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import GradingQueueCard from '@sentadell-src/components/Screen/OperationalGrade/GradingQueueCard/GradingQueueCard';
import styles from './OperationalFetchQueue.style';
import GroupingQueueCard from '@sentadell-src/components/Screen/OperationalGrouping/GroupingQueueCard/GroupingQueueCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { routes } from '@sentadell-src/navigation/RootNavigationParams';

const OperationalFetchQueueScreen: React.FC = () => {
  const navigation = useNavigation();

  const [gradingQueueDetailModalState, setGradingQueueDetailModalState] =
    useState<Omit<GradingQueueDetailModalProps, 'onClose' | 'onUpdateData'>>({
      visible: false
    });

  const fetchQueue = useGetFetchQueues({ isReversed: true });
  const createFetchQueue = useCreateFetchQueue();

  const renderModal = () => {
    return (
      <>
        {gradingQueueDetailModalState.visible && (
          <GradingQueueDetailModal
            {...gradingQueueDetailModalState}
            onClose={() => setGradingQueueDetailModalState({ visible: false })}
            onUpdateData={gradingDataList => {
              createFetchQueue.create({
                type: 'GRADING_UPDATE',
                status: 'QUEUED',
                data: gradingDataList
              });
            }}
          />
        )}
      </>
    );
  };

  const renderCard = useCallback(
    ({ item, index }: { item: FetchQueue; index: number }) => {
      if (item.type === 'GROUPING')
        return (
          <GroupingQueueCard
            queue={item}
            idx={index}
            onPressItem={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: routes.OPERATIONAL_GROUPING_SCAN,
                  params: { fetchQueueId: item._id }
                })
              );
            }}
          />
        );

      return (
        <GradingQueueCard
          queue={item}
          onPressItem={() => {
            if (item.type === 'GRADING' || item.type === 'GRADING_UPDATE') {
              setGradingQueueDetailModalState({
                visible: true,
                queue: item
              });
            }
          }}
          idx={index}
        />
      );
    },
    []
  );

  return (
    <Base headerTitle="Daftar Antrian API" noScroll>
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.gap8}
          numColumns={3}
          columnWrapperStyle={styles.gap8}
          data={fetchQueue}
          renderItem={renderCard}
        />
      </View>
      {renderModal()}
    </Base>
  );
};

export default OperationalFetchQueueScreen;
