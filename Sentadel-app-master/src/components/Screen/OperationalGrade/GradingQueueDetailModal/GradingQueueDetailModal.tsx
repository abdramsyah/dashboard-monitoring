import { FlatList, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import BottomSheetModal from '@sentadell-src/components/Modals/BottomSheetModal/BottomSheetModal';
import { screenHeight } from '@sentadell-src/config/Sizes';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import styles from './GradingQueueDetailModal.styles';
import { Xicon } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';
import {
  alignStyle,
  flexiStyle,
  fwStyle,
  marginStyle,
  paddingStyle
} from '@sentadell-src/utils/moderateStyles';
import lDict from '@sentadell-src/utils/lDict';
import { gradingQueueDataStatusTheme } from '@sentadell-src/constants/grading';
import Button from '@sentadell-src/components/Button/Button';
import { useManageFetchQueue } from '@sentadell-src/stores/realm/actions/fetchQueue';
import {
  GradingQueueData,
  GradingQueueDataStatus
} from '@sentadell-src/stores/realm/schemas/grading';
import { GradingQueueResModel } from '@sentadell-src/types/grading';
import { LOG } from '@sentadell-src/utils/commons';

export interface GradingQueueDetailModalProps {
  visible: boolean;
  onClose: () => void;
  queue?: FetchQueue & Realm.Object<FetchQueue>;
  onUpdateData?: (queue: GradingQueueData[]) => void;
}

const colWidth = {
  status: 0,
  serialNumber: 1,
  grade: 0.7,
  gradePrice: 0.8,
  salesCode: 1,
  grader: 0.8
};

const GradingQueueDetailModal: React.FC<GradingQueueDetailModalProps> = (
  props: GradingQueueDetailModalProps
) => {
  const { visible, onClose, queue, onUpdateData } = props;

  const manageQueue = useManageFetchQueue();

  const [updateObj, setUpdateObj] = useState<{
    [K: string]: boolean;
  }>({});

  const enhancedOnClose = () => {
    onClose();
    setUpdateObj({});
  };

  const renderHeader = () => {
    const renderHeaderText = (title: string, flex?: number) => (
      <TextBase.L style={[fwStyle[700], { flex }]}>{title}</TextBase.L>
    );

    return (
      <View style={styles.headerContainer}>
        <View style={styles.contentDataNumCell}>
          {renderHeaderText('Status')}
        </View>
        {renderHeaderText('No Seri', colWidth.serialNumber)}
        {renderHeaderText('Grade', colWidth.grade)}
        {renderHeaderText('Harga Unit / Grade', colWidth.gradePrice)}
        {renderHeaderText('Barcode Penjualan', colWidth.salesCode)}
        {renderHeaderText('Grader', colWidth.grader)}
      </View>
    );
  };

  const renderBody = useCallback(
    ({ item, index }: { item: GradingQueueData; index: number }) => {
      const backgroundColor =
        index % 2 === 0 ? Colors.base.fullWhite : Colors.base.coolGrey11;
      const newStatus = item.status as GradingQueueDataStatus;
      const chipBg = gradingQueueDataStatusTheme[newStatus];

      const renderBodyText = (title?: string, flex?: number) => (
        <TextBase.S style={{ flex }}>{title}</TextBase.S>
      );

      const renderReferenceData = () => {
        if (
          item.reference_data &&
          item.status !== 'SUCCESS' &&
          item.reference_data.serial_number
        ) {
          const refItem = item.reference_data;

          return (
            <View style={styles.referenceDataContainer}>
              {item.status === 'CREATED' ? (
                <View>
                  <Button
                    theme={
                      item.serial_number &&
                      typeof updateObj[item.serial_number] !== 'undefined'
                        ? 'outlined-red'
                        : 'solid-blue'
                    }
                    customStyle={{ button: styles.width80 }}
                    onPress={() => {
                      setUpdateObj(state => {
                        const newState = { ...state };

                        if (item.serial_number) {
                          if (
                            typeof newState[item.serial_number] !== 'undefined'
                          ) {
                            if (newState[item.serial_number]) {
                              delete newState[item.serial_number];
                            } else {
                              newState[item.serial_number] = true;
                            }
                          } else {
                            newState[item.serial_number] = false;
                          }
                        }

                        return { ...newState };
                      });
                    }}>
                    <TextBase.XS
                      style={{
                        color:
                          item.serial_number &&
                          typeof updateObj[item.serial_number] !== 'undefined'
                            ? Colors.button.red
                            : Colors.text.fullWhite,
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                      {item.serial_number &&
                      typeof updateObj[item.serial_number] !== 'undefined' &&
                      updateObj[item.serial_number]
                        ? 'Update dengan barcode'
                        : 'Update'}
                    </TextBase.XS>
                  </Button>
                </View>
              ) : (
                <View style={styles.contentDataNumCell}>
                  {renderBodyText()}
                </View>
              )}
              <View style={flexiStyle.flex1}>
                <View style={styles.contentDataOtherContainer}>
                  {renderBodyText(refItem.serial_number, colWidth.serialNumber)}
                  {renderBodyText(refItem.grade, colWidth.grade)}
                  {renderBodyText(
                    `${refItem.unit_price} / ${refItem.grade_price}`,
                    colWidth.gradePrice
                  )}
                  {renderBodyText(refItem.sales_code, colWidth.salesCode)}
                  {renderBodyText(refItem.grader_name, colWidth.grader)}
                </View>
              </View>
            </View>
          );
        }
      };

      return (
        <View
          key={index.toString()}
          style={[styles.bodyContainer, { backgroundColor }]}>
          <View style={styles.contentDataContainer}>
            <View style={styles.contentDataNumCell}>
              <View
                style={[
                  { backgroundColor: chipBg },
                  styles.gradingQueueCardChip
                ]}>
                <TextBase.S style={styles.contentDataStatus}>
                  {lDict[item.status]}
                </TextBase.S>
              </View>
            </View>
            <View style={flexiStyle.flex1}>
              <View style={styles.contentDataOtherContainer}>
                {renderBodyText(item.serial_number, colWidth.serialNumber)}
                {renderBodyText(item.grade_data?.grade, colWidth.grade)}
                {renderBodyText(
                  `${item.unit_price} / ${item.grade_data?.price}`,
                  colWidth.gradePrice
                )}
                {renderBodyText(item.sales_code, colWidth.salesCode)}
                {renderBodyText(item.grader_name, colWidth.grader)}
              </View>
            </View>
          </View>
          {renderReferenceData()}
        </View>
      );
    },
    [updateObj]
  );

  const renderBottom = () => {
    if (!Object.keys(updateObj).length) return;

    const onPressUpdate = () => {
      if (queue) {
        const gradingQueueResArr: GradingQueueResModel[] = [];
        const gradingQueueArr: GradingQueueData[] = [];

        queue.gradingData?.forEach((e, idx) => {
          const gradingQueueResModel: GradingQueueResModel = {
            index: idx,
            serial_number: e.serial_number || '',
            sales_code: e.sales_code || '',
            client_id: e.grade_data?.client_id || 0,
            reference_data: e.reference_data,
            status: e.status,
            message: e.message
          };

          if (
            e.serial_number &&
            typeof updateObj[e.serial_number] !== 'undefined'
          ) {
            gradingQueueResModel.status = 'UPDATED';
            if (gradingQueueResModel.status === 'UPDATED')
              gradingQueueResModel.withBarcode = updateObj[e.serial_number];

            const gradingQueueData = {
              index: idx,
              serial_number: e.serial_number,
              grade_data: e.grade_data,
              unit_price: e.unit_price,
              grader_name: e.grader_name,
              sales_code: updateObj[e.serial_number]
                ? e.sales_code
                : e.reference_data?.sales_code,
              sales_code_data: updateObj[e.serial_number]
                ? e.sales_code_data
                : undefined,
              reference_data: e.reference_data,
              status: 'ON_PROGRESS',
              message: e.message
            } as GradingQueueData;

            gradingQueueArr.push(gradingQueueData);
          }

          LOG.warn('gradingQueueResModel', gradingQueueResModel);

          gradingQueueResArr.push(gradingQueueResModel);
        });
        manageQueue.change({
          obj: queue,
          status: 'COMPLETED',
          gradingData: gradingQueueResArr
        });

        if (onUpdateData) onUpdateData(gradingQueueArr);
        enhancedOnClose();
      }
    };

    return (
      <View style={styles.bottomContainer}>
        <Button
          title={`Update ${Object.keys(updateObj).length} Data`}
          onPress={onPressUpdate}
        />
      </View>
    );
  };

  return (
    <BottomSheetModal
      maskCloseArea
      onClose={enhancedOnClose}
      visible={visible}
      customStyle={{
        contentStyle: paddingStyle.ph20
      }}
      customSize={{
        maxH: screenHeight * 0.9,
        minH: screenHeight * 0.9
      }}>
      <TouchableOpacity style={styles.xButton} onPress={enhancedOnClose}>
        <Xicon
          stroke={Colors.base.fullBlack}
          height={18}
          width={18}
          strokeWidth={3}
        />
      </TouchableOpacity>
      <View style={[alignStyle.allCenter, marginStyle.mv20]}>
        <TextBase.L style={styles.fw700}>Detail</TextBase.L>
      </View>
      <FlatList
        data={queue?.gradingData}
        contentContainerStyle={styles.gap5}
        ListHeaderComponent={renderHeader()}
        renderItem={renderBody}
      />
      {queue?.status === 'PAUSED' && (
        <View style={styles.retryButton}>
          <Button
            title="Upload Ulang"
            onPress={() => {
              manageQueue.change({ obj: queue, status: 'QUEUED' });
              enhancedOnClose();
            }}
          />
        </View>
      )}
      {renderBottom()}
    </BottomSheetModal>
  );
};

export default GradingQueueDetailModal;
