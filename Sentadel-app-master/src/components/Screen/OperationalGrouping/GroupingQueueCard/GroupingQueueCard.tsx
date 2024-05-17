import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import dayjs from 'dayjs';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { gradingQueueStatusTheme } from '@sentadell-src/constants/grading';
import styles from './GroupingQueueCard.style';
import TextBase from '@sentadell-src/components/Text/TextBase';
import lDict from '@sentadell-src/utils/lDict';

interface GroupingQueueCardProps {
  queue: FetchQueue;
  onPressItem: (
    queue: FetchQueue & Realm.Object<FetchQueue>,
    idx: number
  ) => void;
  idx: number;
}

const GroupingQueueCard: React.FC<GroupingQueueCardProps> = (
  props: GroupingQueueCardProps
) => {
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

  const fetchQueueCardBg = gradingQueueStatusTheme[queue.status || 'QUEUED'];

  return (
    <TouchableOpacity
      key={queue._id}
      activeOpacity={0.7}
      onPress={() => onPressItem(queue, idx)}
      style={[styles.groupingQueueCard, { backgroundColor: fetchQueueCardBg }]}>
      <View style={styles.groupingQueueCardHeader}>
        <TextBase.M>{queueDate()}</TextBase.M>
        <TextBase.M>{queueDjs.format('HH:mm')}</TextBase.M>
      </View>
      <TextBase.L style={{ fontWeight: '700' }}>
        {queue.groupingData?.grouping_list?.length}
      </TextBase.L>
      <TextBase.M key={queue?._id}>{lDict[queue.status || '']}</TextBase.M>
    </TouchableOpacity>
  );
};

export default GroupingQueueCard;
