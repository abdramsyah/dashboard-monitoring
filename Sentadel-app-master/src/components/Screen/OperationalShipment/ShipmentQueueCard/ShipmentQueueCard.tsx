import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import dayjs from 'dayjs';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { gradingQueueStatusTheme } from '@sentadell-src/constants/grading';
import styles from './ShipmentQueueCard.style';
import TextBase from '@sentadell-src/components/Text/TextBase';
import lDict from '@sentadell-src/utils/lDict';
import {
  alignStyle,
  flexiStyle,
  fwStyle
} from '@sentadell-src/utils/moderateStyles';
import Colors from '@sentadell-src/config/Colors';

interface ShipmentQueueCardProps {
  queue: FetchQueue;
  onPressItem: (
    queue: FetchQueue & Realm.Object<FetchQueue>,
    idx: number
  ) => void;
  idx: number;
}

const ShipmentQueueCard: React.FC<ShipmentQueueCardProps> = (
  props: ShipmentQueueCardProps
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
      style={[styles.shipmentQueueCard, { backgroundColor: fetchQueueCardBg }]}>
      <View style={styles.shipmentQueueCardHeader}>
        <TextBase.M>{queueDate()}</TextBase.M>
        <TextBase.M>{queueDjs.format('HH:mm')}</TextBase.M>
      </View>
      <View
        style={{
          backgroundColor: Colors.chip.bgColor,
          borderWidth: 1,
          borderColor: Colors.border.purpleOcean,
          borderRadius: 10,
          alignItems: 'center'
        }}>
        <TextBase.S style={fwStyle[700]}>
          {queue.shipmentData?.shipment_type}
        </TextBase.S>
      </View>
      <View style={[flexiStyle.flexRow, alignStyle.centerBetween]}>
        <TextBase.M style={fwStyle[700]}>
          {queue.shipmentData?.client_code}
        </TextBase.M>
        <TextBase.L style={fwStyle[700]}>
          {queue.shipmentData?.grouping_data_list?.length}
        </TextBase.L>
      </View>
      <TextBase.M key={queue?._id}>{lDict[queue.status || '']}</TextBase.M>
    </TouchableOpacity>
  );
};

export default ShipmentQueueCard;
