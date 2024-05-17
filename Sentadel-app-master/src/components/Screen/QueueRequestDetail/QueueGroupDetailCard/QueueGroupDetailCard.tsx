import { View, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import {
  GroupByQueueGroupDetailEnum,
  InvoiceCardType,
  QueueGroupDetailModel
} from '@sentadell-src/types/queue';
import styles from './QueueGroupDetailCard.styles';
import { TobaccoBucketIcon } from '@sentadell-src/config/Svgs';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import { formatCurrency } from '@sentadell-src/utils/commons';
import { invoiceStatusLabel } from '@sentadell-src/constants/invoices';
import {
  conditionalContent,
  invoiceCardParamsList
} from '@sentadell-src/constants/queue';

interface QueueGroupDetailCardProps {
  expandable?: boolean;
  item?: QueueGroupDetailModel;
  index?: number;
  groupBy: GroupByQueueGroupDetailEnum;
}

const QueueGroupDetailCard: React.FC<QueueGroupDetailCardProps> = (
  props: QueueGroupDetailCardProps
) => {
  const { expandable, item, index, groupBy } = props;

  const [expanded, setExpanded] = useState(false);

  const renderRowParams = useCallback((e: InvoiceCardType, i: number) => {
    const width = i % 2 != 0 ? '36%' : '60%';

    return (
      <View
        key={i.toString()}
        style={{
          width,
          ...flexiStyle.flexRow
        }}>
        <TextBase.XS style={{ flex: 7 }}>{e.title}</TextBase.XS>
        <TextBase.XS style={{ flex: 1 }}>:</TextBase.XS>
        <TextBase.XS style={{ flex: 10, textAlign: 'right' }}>
          {e.value ? `${e.value} ${e.suffix || ''}` : '-'}
        </TextBase.XS>
      </View>
    );
  }, []);

  return (
    <View>
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={0.8}
        disabled={!expandable}
        onPress={() => setExpanded(state => !state)}>
        <View style={styles.cardHeader1}>
          <TextBase.M style={styles.textWhite600}>
            {`${(index || 0) + 1})   ${
              groupBy === 'INVOICE'
                ? item?.filter_param || 'Dalam Proses'
                : item?.filter_param
            }`}
          </TextBase.M>
          <View style={styles.totalBucket}>
            <TobaccoBucketIcon stroke={Colors.base.fullWhite} />
            <TextBase.M style={styles.textWhite600}>
              {item?.queue_data?.length}
            </TextBase.M>
          </View>
        </View>
        <TextBase.M style={styles.textWhite600}>
          Akumulasi Harga: {formatCurrency(item?.purchase_price_accum, true)}
        </TextBase.M>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.gap16}>
          {item?.queue_data?.map((queue, qIdx) => {
            const statusKey = queue.status_list?.length
              ? queue.status_list[0].status
              : 'ON_PROGRESS';

            return (
              <View key={qIdx.toString()} style={styles.nestCardContainer}>
                <View style={styles.nestCardHeader}>
                  <View style={flexiStyle.flexRow1}>
                    <TextBase.M style={styles.nestCardNumber}>
                      {qIdx + 1}
                    </TextBase.M>
                    <TextBase.M style={styles.fw600}>
                      {queue.serial_number}
                    </TextBase.M>
                  </View>
                  {queue.status === 'REJECTED' ? (
                    <View
                      style={{
                        backgroundColor: invoiceStatusLabel.REJECTED.color,
                        ...styles.goodsAndInvoiceStatus
                      }}>
                      <TextBase.XS style={styles.textWhite}>
                        Barang Ditolak
                      </TextBase.XS>
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: invoiceStatusLabel[statusKey].color,
                        ...styles.goodsAndInvoiceStatus
                      }}>
                      <TextBase.XS style={styles.textWhite}>
                        {invoiceStatusLabel[statusKey].label}
                      </TextBase.XS>
                    </View>
                  )}
                </View>
                <View style={styles.horizontalLine} />
                <View style={styles.nestCardContent}>
                  {[
                    ...(conditionalContent(queue)[groupBy] || []),
                    ...invoiceCardParamsList(queue)
                  ].map(renderRowParams)}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default QueueGroupDetailCard;
