import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import dayjs from 'dayjs';
import { GradingQueueDataStatus } from '@sentadell-src/stores/realm/schemas/grading';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import {
  gradingQueueDataStatusTheme,
  gradingQueueStatusTheme
} from '@sentadell-src/constants/grading';
import styles from './GradingQueueCard.style';
import TextBase from '@sentadell-src/components/Text/TextBase';
import lDict from '@sentadell-src/utils/lDict';

interface GradingQueueCardProps {
  queue: FetchQueue;
  onPressItem: (
    queue: FetchQueue & Realm.Object<FetchQueue>,
    idx: number
  ) => void;
  idx: number;
}

const GradingQueueCard = (props: GradingQueueCardProps) => {
  const { queue, onPressItem, idx } = props;
  const queueDjs = dayjs(queue.trx_timestamp * 1000);
  const todayDjs = dayjs();
  const queueDate = () => {
    if (queueDjs.date() === todayDjs.date()) {
      return 'Hari ini';
    } else if (queueDjs.date() === todayDjs.date() - 1) {
      return 'Kemarin';
    }

    return queueDjs.format('DD MMM YYYY');
  };
  const gradingQueueDataStatus = () => {
    const dummy: { [K in GradingQueueDataStatus]: number } = {
      SUCCESS: 0,
      FAILED: 0,
      ON_PROGRESS: 0,
      VALIDATED: 0,
      CREATED: 0,
      USED: 0,
      UPDATED: 0
    };

    queue.gradingData?.forEach(grading => {
      dummy[grading.status] += 1;
    });

    return dummy;
  };

  const fetchQueueCardBg = gradingQueueStatusTheme[queue.status || 'QUEUED'];

  return (
    <TouchableOpacity
      key={queue._id}
      activeOpacity={0.7}
      onPress={() => onPressItem(queue, idx)}
      style={[styles.gradingQueueCard, { backgroundColor: fetchQueueCardBg }]}>
      <View style={styles.gradingQueueCardHeader}>
        <TextBase.M>{queueDate()}</TextBase.M>
        <TextBase.M>{queueDjs.format('HH:mm')}</TextBase.M>
      </View>
      <View style={styles.gradingQueueCardChipContainer}>
        {Object.keys(gradingQueueDataStatus())?.map((status, index) => {
          const newStatus = status as GradingQueueDataStatus;

          if (gradingQueueDataStatus()[newStatus]) {
            const chipBg = gradingQueueDataStatusTheme[newStatus];

            return (
              <View
                key={index.toString()}
                style={[
                  { backgroundColor: chipBg },
                  styles.gradingQueueCardChip
                ]}>
                <TextBase.S key={index.toString()}>
                  {`${lDict[status]} ${gradingQueueDataStatus()[newStatus]}`}
                </TextBase.S>
              </View>
            );
          }
        })}
      </View>
      <TextBase.M key={queue?._id}>{lDict[queue.status || '']}</TextBase.M>
    </TouchableOpacity>
  );
};

export default GradingQueueCard;
