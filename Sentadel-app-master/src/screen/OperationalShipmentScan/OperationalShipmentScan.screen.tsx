import { View } from 'react-native';
import React, { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalShipmentScan.styles';
import ScannerView from '@sentadell-src/components/ScannerView/ScannerView';
import {
  barcodeaSalesPattern,
  serialNumberPattern
} from '@sentadell-src/utils/regexp';
import { showMessage } from 'react-native-flash-message';
import { screenHeight } from '@sentadell-src/config/Sizes';
import { Barcode } from '@mgcrea/vision-camera-barcode-scanner';
import { useManageFetchQueue } from '@sentadell-src/stores/realm/actions/fetchQueue';
import { GropuingQueueGoodsData } from '@sentadell-src/stores/realm/schemas/grouping';
import RealmCtx from '@sentadell-src/database/realm';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Button from '@sentadell-src/components/Button/Button';
import { RefreshSvg } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import { RouteProp } from '@react-navigation/native';
import { useManageShipmentData } from '@sentadell-src/stores/realm/actions/shipment';
import InformationModal from '@sentadell-src/components/Screen/OperationalShipmentScan/InformationModal/InformationModal';
import DjarumGroupingScan from '@sentadell-src/components/Screen/OperationalShipmentScan/DjarumGroupingScan/DjarumGroupingScan';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_SHIPMENT_SCAN
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.OPERATIONAL_SHIPMENT_SCAN
>;

interface OperationalGroupingScanScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const OperationalShipmentScanScreen: React.FC<
  OperationalGroupingScanScreenProps
> = (props: OperationalGroupingScanScreenProps) => {
  const { navigation, route } = props;

  const manageFetchQueue = useManageFetchQueue();
  const manageShipmentQueue = useManageShipmentData();
  const fetchQueue = RealmCtx.useQuery<FetchQueue>('FetchQueue').filtered(
    '_id == $0',
    route.params?.fetchQueueId
  )[0];

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const onScanned = async (codes: Omit<Barcode, 'native'>[]) => {
    if (!manageShipmentQueue.syncLoading) {
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

          // const isDuplicate = fetchQueue?.shipmentData?.grouping_data_list?.some(
          //   e =>
          //     e.serial_number === groupingQueueGoodsData.serial_number ||
          //     e.sales_code === groupingQueueGoodsData.sales_code
          // );

          // if (isDuplicate) {
          //   showMessage({
          //     type: 'danger',
          //     message: 'Sudah discan'
          //   });
          //   return;
          // }

          // if (fetchQueue?.shipmentData) {
          //   manageGroupingQueue.add(
          //     fetchQueue?.shipmentData,
          //     groupingQueueGoodsData
          //   );
          // }
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
    // if (fetchQueue?.status === 'COMPLETED') return true;
    // if (!fetchQueue?.shipmentData?.grouping_data_list?.length) return true;

    // let gradeInitial = '';
    // let clientCode = '';
    // let ub = -1;

    // const checker = fetchQueue?.shipmentData?.grouping_data_list?.every(e => {
    //   if (e.status !== 'READY') return false;
    //   if (e.client_code === 'DJRM') {
    //     if (e.djarum_grade !== e.grade) return false;
    //     if (!(ub >= 0)) ub = e.ub || 0;
    //     LOG.warn(`checker - ub ${ub} - ${e.ub}`);
    //     LOG.warn('checker - ub >= 0 && e.ub !== ub', ub >= 0 && e.ub !== ub);
    //     if (ub >= 0 && e.ub !== ub) return false;
    //   }
    //   if (!clientCode) clientCode = e.client_code || '';
    //   if (clientCode && e.client_code !== clientCode) return false;
    //   if (!gradeInitial) gradeInitial = e.grade ? e.grade[0] : '';
    //   if (gradeInitial && e.grade && e.grade[0] !== gradeInitial) return false;

    //   return true;
    // });

    // return !checker;

    return true;
  };

  const renderTable = () => {
    if (fetchQueue.shipmentData?.shipment_type === 'GROUPING')
      return (
        <DjarumGroupingScan
          data={fetchQueue?.shipmentData?.grouping_data_list || []}
        />
      );
  };

  const renderModal = () => {
    return (
      <>
        {isInfoModalOpen && (
          <InformationModal
            isOpen={isInfoModalOpen}
            onClose={() => setIsInfoModalOpen(false)}
            fetchQueue={fetchQueue}
          />
        )}
      </>
    );
  };

  const renderScanner = () => {
    const isActive = () => {
      if (route.params?.fetchQueueId && fetchQueue?.status === 'COMPLETED')
        return false;

      return !manageShipmentQueue.syncLoading;
    };

    return (
      <View style={styles.scannerInnerContaienr}>
        <ScannerView
          isActive={isActive()}
          // isActive={false}
          onCodeScanned={onScanned}
          scanInterval={1500}
          containerStyle={{
            height: screenHeight * 0.3
          }}
          scanRegion={{ width: 400, height: 220 }}
        />
      </View>
    );
  };

  return (
    <Base headerTitle={'Gulungan (Scan)'} noScroll>
      <View style={styles.container}>
        <View style={styles.scannerContainer}>{renderScanner()}</View>
        <View style={styles.shipmentDataContainer}>
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
              title="Info"
              customStyle={{ container: flexiStyle.flex1 }}
              onPress={() => setIsInfoModalOpen(true)}
            />
            <Button
              customStyle={{
                container: { flex: 1 },
                button: flexiStyle.flexRowG1
              }}
              disabled={
                fetchQueue?.status === 'COMPLETED' ||
                !fetchQueue?.shipmentData?.grouping_data_list?.length
              }
              theme="outlined-red"
              onPress={() => {
                if (fetchQueue?.shipmentData) {
                  manageShipmentQueue.sync(fetchQueue?.shipmentData);
                }
              }}>
              <RefreshSvg stroke={Colors.base.fullBlack} />
              <TextBase.M>Sync</TextBase.M>
            </Button>
          </View>
          <View style={{ height: screenHeight * 0.42 }}>{renderTable()}</View>
        </View>
      </View>
      {renderModal()}
    </Base>
  );
};

export default OperationalShipmentScanScreen;
