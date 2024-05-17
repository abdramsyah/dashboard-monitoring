import { FlatList, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalGroupingScan.styles';
import ScannerView from '@sentadell-src/components/ScannerView/ScannerView';
import {
  barcodeaSalesPattern,
  serialNumberPattern
} from '@sentadell-src/utils/regexp';
import { showMessage } from 'react-native-flash-message';
import { screenHeight } from '@sentadell-src/config/Sizes';
import { Barcode } from '@mgcrea/vision-camera-barcode-scanner';
import {
  useCreateFetchQueue,
  useManageFetchQueue
} from '@sentadell-src/stores/realm/actions/fetchQueue';
import {
  GropuingQueueGoodsData,
  GroupingQueueData
} from '@sentadell-src/stores/realm/schemas/grouping';
import { useManageGroupingData } from '@sentadell-src/stores/realm/actions/grouping';
import RealmCtx from '@sentadell-src/database/realm';
import BaseTable, {
  ColumnType
} from '@sentadell-src/components/Table/BaseTable/BaseTable';
import TextBase, {
  fontSizeEnum
} from '@sentadell-src/components/Text/TextBase';
import Button from '@sentadell-src/components/Button/Button';
import { RefreshSvg, TrashIcon } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import { RouteProp } from '@react-navigation/native';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_GROUPING_SCAN
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.OPERATIONAL_GROUPING_SCAN
>;

interface OperationalGroupingScanScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

type GroupingColumns = {
  isLoading: boolean;
  onPress: (item: GropuingQueueGoodsData) => void;
  disabled: boolean;
};

const groupingGeneralColumns: (
  props: GroupingColumns
) => ColumnType<GropuingQueueGoodsData>[] = ({
  isLoading,
  onPress,
  disabled
}) => [
  {
    title: 'Nomor Seri',
    key: 'serial_number'
  },
  { title: 'Barcode Penjualan', key: 'sales_code' },
  { title: 'Grade', key: 'grade' },
  { title: 'Status', key: 'status' },
  {
    title: 'Action',
    render: (item: GropuingQueueGoodsData) => (
      <Button
        theme="solid-red"
        customStyle={{
          container: {
            flex: 0
          }
        }}
        isLoading={isLoading}
        disabled={disabled}
        onPress={() => onPress(item)}>
        <TrashIcon stroke={Colors.button.fullWhite} />
      </Button>
    )
  }
];

const groupingDjarumColumns: (
  props: GroupingColumns
) => ColumnType<GropuingQueueGoodsData>[] = ({
  isLoading,
  onPress,
  disabled
}) => [
  { title: 'Barcode Djarum', key: 'sales_code' },
  { title: 'Nomor Seri', key: 'serial_number' },
  {
    title: 'Grade',
    render: (item: GropuingQueueGoodsData) => (
      <TextBase.XS
        style={{
          color: item.grade !== item.djarum_grade ? Colors.chip.red : undefined
        }}>
        {item.grade}
      </TextBase.XS>
    ),
    width: 40
  },
  {
    title: 'Grade Djarum',
    render: (item: GropuingQueueGoodsData) => (
      <TextBase.XS
        style={{
          color: item.grade !== item.djarum_grade ? Colors.chip.red : undefined
        }}>
        {item.djarum_grade}
      </TextBase.XS>
    ),
    width: 40
  },
  {
    title: 'UB',
    key: 'ub',
    width: 30
  },
  { title: 'Status', key: 'status' },
  {
    title: 'Action',
    render: (item: GropuingQueueGoodsData) => (
      <Button
        theme="solid-red"
        customStyle={{
          container: {
            flex: 0
          }
        }}
        isLoading={isLoading}
        disabled={disabled}
        onPress={() => onPress(item)}>
        <TrashIcon stroke={Colors.button.fullWhite} />
      </Button>
    )
  }
];

const OperationalGroupingScanScreen: React.FC<
  OperationalGroupingScanScreenProps
> = (props: OperationalGroupingScanScreenProps) => {
  const { navigation, route } = props;
  const [fetchQueueId, setFetchQueueId] = useState('');

  const baseTableRef = useRef<FlatList<GropuingQueueGoodsData>>(null);

  const createFetchQueue = useCreateFetchQueue();
  const manageFetchQueue = useManageFetchQueue();
  const manageGroupingQueue = useManageGroupingData();
  const fetchQueue = RealmCtx.useQuery<FetchQueue>('FetchQueue').filtered(
    '_id == $0',
    route.params?.fetchQueueId || fetchQueueId
  )[0];

  const onScanned = async (codes: Omit<Barcode, 'native'>[]) => {
    if (!manageGroupingQueue.syncLoading) {
      try {
        const isSerialNumber = serialNumberPattern.test(codes[0].value || '');
        const isBarcodeSales = barcodeaSalesPattern.test(codes[0].value || '');
        const isDjarumQR = codes[0].value?.split('_').length === 7;

        if (isBarcodeSales || isSerialNumber || isDjarumQR) {
          const groupingQueueGoodsData = {
            serial_number: isSerialNumber ? codes[0].value : undefined,
            sales_code: isBarcodeSales ? codes[0].value : undefined
          } as GropuingQueueGoodsData;

          if (isDjarumQR && codes[0].value) {
            const djarumQr = codes[0].value.split('_');
            const djarumCode = djarumQr[0].replaceAll('CC', '');
            const djarumGrade = djarumQr[4] + djarumQr[5].split(' - ')[0];

            groupingQueueGoodsData.sales_code = djarumCode;
            groupingQueueGoodsData.djarum_grade = djarumGrade;
          }

          if (!(fetchQueueId || route.params?.fetchQueueId)) {
            const groupingQueueData = {
              grouping_list: [
                groupingQueueGoodsData
              ] as GropuingQueueGoodsData[]
            } as GroupingQueueData;

            createFetchQueue.create({
              type: 'GROUPING',
              data: groupingQueueData,
              status: 'PAUSED',
              onSuccess: obj => {
                setFetchQueueId(obj?._id || '');
                if (obj?.groupingData)
                  manageGroupingQueue.sync(obj?.groupingData);
              }
            });
          } else {
            const isDuplicate = fetchQueue?.groupingData?.grouping_list?.some(
              e =>
                e.serial_number === groupingQueueGoodsData.serial_number ||
                e.sales_code === groupingQueueGoodsData.sales_code
            );

            if (isDuplicate) {
              showMessage({
                type: 'danger',
                message: 'Sudah discan'
              });
              return;
            }

            if (fetchQueue?.groupingData) {
              manageGroupingQueue.add(
                fetchQueue?.groupingData,
                groupingQueueGoodsData,
                () => baseTableRef.current?.scrollToEnd()
              );
            }
          }
        }
      } catch (err) {
        showMessage({
          type: 'warning',
          message: 'Terjadi kesalahan. ' + err
        });
      }
    }
  };

  const submitButtonDisabled = () => {
    if (fetchQueue?.status === 'COMPLETED') return true;
    if (!fetchQueue?.groupingData?.grouping_list?.length) return true;

    let gradeInitial = '';
    let clientCode = '';
    let ub = -1;

    const checker = fetchQueue?.groupingData?.grouping_list?.every(e => {
      if (e.status !== 'READY') return false;
      if (e.client_code === 'DJRM') {
        if (e.djarum_grade !== e.grade) return false;
        if (!(ub >= 0)) ub = e.ub || 0;
        if (ub >= 0 && e.ub !== ub) return false;
      }
      if (!clientCode) clientCode = e.client_code || '';
      if (clientCode && e.client_code !== clientCode) return false;
      if (!gradeInitial) gradeInitial = e.grade ? e.grade[0] : '';
      if (gradeInitial && e.grade && e.grade[0] !== gradeInitial) return false;

      return true;
    });

    return !checker;
  };

  const renderScanner = () => {
    const isActive = () => {
      if (route.params?.fetchQueueId && fetchQueue?.status === 'COMPLETED')
        return false;

      return !manageGroupingQueue.syncLoading;
    };

    return (
      <View style={styles.scannerInnerContaienr}>
        <ScannerView
          onCodeScanned={onScanned}
          scanInterval={1500}
          containerStyle={{
            height: screenHeight * 0.3
          }}
          scanRegion={{ width: 400, height: 220 }}
          isActive={isActive()}
          // isActive={false}
        />
      </View>
    );
  };

  const currentColumn = () => {
    if (
      fetchQueue?.groupingData?.grouping_list?.length &&
      fetchQueue?.groupingData.grouping_list[0].client_code === 'DJRM'
    )
      return groupingDjarumColumns({
        isLoading: manageGroupingQueue.isLoading,
        onPress: item => {
          if (fetchQueue?.groupingData)
            manageGroupingQueue.remove(fetchQueue?.groupingData, item);
        },
        disabled: fetchQueue?.status === 'COMPLETED'
      });

    return groupingGeneralColumns({
      isLoading: manageGroupingQueue.isLoading,
      onPress: item => {
        if (fetchQueue?.groupingData)
          manageGroupingQueue.remove(fetchQueue?.groupingData, item);
      },
      disabled: fetchQueue?.status === 'COMPLETED'
    });
  };

  return (
    <Base headerTitle={'Gulungan (Scan)'} noScroll>
      <View style={styles.container}>
        <View style={styles.scannerContainer}>{renderScanner()}</View>
        <View style={styles.groupingDataContainer}>
          <View style={flexiStyle.flexRowG2}>
            <Button
              customStyle={{ container: { flex: 1 } }}
              title="Submit"
              disabled={submitButtonDisabled()}
              onPress={() => {
                if (fetchQueue) {
                  manageFetchQueue.change({
                    obj: fetchQueue,
                    status: 'QUEUED'
                  });
                  navigation.goBack();
                }
              }}
            />
            <Button
              customStyle={{
                container: { flex: 1 },
                button: flexiStyle.flexRowG1
              }}
              disabled={
                fetchQueue?.status === 'COMPLETED' ||
                !fetchQueue?.groupingData?.grouping_list?.length
              }
              theme="outlined-red"
              onPress={() => {
                if (fetchQueue?.groupingData) {
                  manageGroupingQueue.sync(fetchQueue?.groupingData);
                }
              }}>
              <RefreshSvg stroke={Colors.base.fullBlack} />
              <TextBase.M>Sync</TextBase.M>
            </Button>
          </View>
          <View
            style={{
              height: screenHeight * 0.42
            }}>
            <BaseTable
              ref={baseTableRef}
              data={fetchQueue?.groupingData?.grouping_list}
              useNum
              columns={currentColumn()}
              fontSize={fontSizeEnum.XS}
            />
          </View>
        </View>
      </View>
    </Base>
  );
};

export default OperationalGroupingScanScreen;
