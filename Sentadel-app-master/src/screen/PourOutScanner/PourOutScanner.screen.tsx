import { ActivityIndicator, ScrollView, View } from 'react-native';
import React, { useState } from 'react';
import Base from '@sentadell-src/components/Base/Base';
import ScannerView from '@sentadell-src/components/ScannerView/ScannerView';
import { getBarcodeDetail, pourOut } from '@sentadell-src/apis/queries/fetch';
import { MUTATION_KEY, QUERY_KEY } from '@sentadell-src/apis/queries/key';
import {
  SuccessResponseType,
  ErrorResponseType
} from '@sentadell-src/types/global';
import {
  BarcodeScanListType,
  PourOutConfirmationModalCtrlType,
  CreateGoodsResModel,
  ScannedStatusEnum,
  PourOutPayloadType,
  BarcodeDetailModel
} from '@sentadell-src/types/queue';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Chip } from 'react-native-paper';
import TextBase from '@sentadell-src/components/Text/TextBase';
import ConfirmationModal from '@sentadell-src/components/Modals/ConfirmationModal/ConfirmationModal';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import {
  bucketStatusTheme,
  bucketStatusTranslate
} from '@sentadell-src/constants/queue';
import { widthStyle } from '@sentadell-src/utils/moderateStyles';
import styles from './PourOutScanner.styles';
import { serialNumberPattern } from '@sentadell-src/utils/regexp';
import { showMessage } from 'react-native-flash-message';
import { Barcode } from '@mgcrea/vision-camera-barcode-scanner';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_POUR_OUT
>;

interface PourOutScannerProps {
  navigation: NavigationProps;
}

const PourOutScanner: React.FC<PourOutScannerProps> = (
  props: PourOutScannerProps
) => {
  const {} = props;

  const [barcodeScanList, setBarcodeScanList] = useState<BarcodeScanListType[]>(
    []
  );
  const [confirmationModalCtrl, setConfrimationModalCtrl] =
    useState<PourOutConfirmationModalCtrlType>({
      open: false
    });

  const getStatusMessage = (res: CreateGoodsResModel) => {
    switch (res.current_status) {
      case ScannedStatusEnum.AlreadyApproved:
        return `Sudah diterima pada ${dayjs(res.transaction_date || '').format(
          'D MMM YYYY HH:mm'
        )}`;

      case ScannedStatusEnum.AlreadyRejected:
        return `Sudah ditolak pada ${dayjs(res.transaction_date || '').format(
          'D MMM YYYY HH:mm'
        )}`;

      default:
        break;
    }
  };

  const onSuccessPourOut = (
    data: SuccessResponseType<CreateGoodsResModel[], PourOutPayloadType>
  ) => {
    setConfrimationModalCtrl({ open: false });
    setBarcodeScanList(state => {
      const res = data?.data?.data[0];
      const message = getStatusMessage(res);
      const newBarcode: BarcodeScanListType = {
        key: state.length + 1,
        serial_number: res.serial_number || '',
        status: res.current_status,
        message
      };

      return [newBarcode, ...state];
    });
  };

  const onErrorPourOut = (
    err: ErrorResponseType<unknown, PourOutPayloadType>
  ) => {
    setConfrimationModalCtrl({ open: false });
    showMessage({
      type: 'danger',
      message: 'Terjadi Kesalahan!,' + err
    });
  };

  const onSuccessGetBarcodeDetail = (
    data: SuccessResponseType<BarcodeDetailModel, string>
  ) => {
    setConfrimationModalCtrl(state => ({
      ...state,
      ...data.data.data
    }));
  };

  const onErrorGetBarcodeDetail = (err: ErrorResponseType<unknown, string>) =>
    showMessage({
      type: 'danger',
      message: 'Terjadi Kesalahan!,' + err
    });

  const pourOutMt = useMutation({
    mutationKey: [MUTATION_KEY.POUR_OUT],
    mutationFn: pourOut,
    onSuccess: onSuccessPourOut,
    onError: onErrorPourOut
  });

  const getBarcodeDetailMt = useMutation({
    mutationKey: [QUERY_KEY.GET_BARCODE_DETAIL],
    mutationFn: getBarcodeDetail,
    onSuccess: onSuccessGetBarcodeDetail,
    onError: onErrorGetBarcodeDetail
  });

  const onScanned = (codes: Omit<Barcode, 'native'>[]) => {
    try {
      const isSerialNumber = serialNumberPattern.test(codes[0].value || '');

      if (isSerialNumber) {
        setConfrimationModalCtrl({
          open: true
        });
        getBarcodeDetailMt.mutate(codes[0].value || '');
      } else {
        throw 'Bukan nomor seri';
      }
    } catch (err) {
      showMessage({
        type: 'warning',
        message: 'Terjadi kesalahan!, ' + err
      });
    }
  };

  const onConfirm = (status: ScannedStatusEnum) => {
    pourOutMt.mutate({
      data: [
        { serial_number: confirmationModalCtrl.serial_number || '', status }
      ]
    });
  };

  return (
    <Base headerTitle="Pemindai Barang Masuk" noScroll>
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <ScannerView
            onCodeScanned={onScanned}
            scanInterval={5000}
            scanRegion={{ width: 300, height: 300 }}
            containerStyle={{ height: 400 }}
          />
        </View>
        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.contentContainerScrollView}>
            {barcodeScanList.map((item, idx) => (
              <View key={idx.toString()} style={styles.scannedBarcodeCard}>
                {item.status && item.serial_number && (
                  <Chip
                    mode="flat"
                    style={{
                      backgroundColor: bucketStatusTheme[item.status]
                    }}>
                    <TextBase.L style={styles.textWhite}>
                      {item.serial_number}
                    </TextBase.L>
                  </Chip>
                )}
                {item.message && <TextBase.M>{item.message}</TextBase.M>}
                {item.status && (
                  <Chip
                    mode="flat"
                    style={{
                      backgroundColor: bucketStatusTheme[item.status]
                    }}>
                    <TextBase.M style={styles.textWhite}>
                      {bucketStatusTranslate[item.status]}
                    </TextBase.M>
                  </Chip>
                )}
              </View>
            ))}
          </ScrollView>
          {confirmationModalCtrl.open && (
            <ConfirmationModal
              visible={confirmationModalCtrl.open}
              onClose={() => setConfrimationModalCtrl({ open: false })}
              onConfirm={() => onConfirm(ScannedStatusEnum.Approve)}
              confirm="Terima"
              onCancel={() => onConfirm(ScannedStatusEnum.Reject)}
              cancel="Tolak"
              title={`Proses barang ini : ${confirmationModalCtrl.serial_number}`}
              isLoading={pourOutMt.isPending}>
              {getBarcodeDetailMt.isPending ? (
                <ActivityIndicator />
              ) : (
                <View style={styles.cmChildContainer}>
                  <View style={styles.cmContentRowContainer}>
                    <TextBase.XL style={widthStyle.width40}>
                      Koordinator
                    </TextBase.XL>
                    <TextBase.XL>
                      : {confirmationModalCtrl.coordinator_name || '-'}
                    </TextBase.XL>
                  </View>
                  <View style={styles.cmContentRowContainer}>
                    <TextBase.XL style={widthStyle.width40}>Petani</TextBase.XL>
                    <TextBase.XL>
                      : {confirmationModalCtrl.farmer_name}
                    </TextBase.XL>
                  </View>
                  <View style={styles.cmContentRowContainer}>
                    <TextBase.XL style={widthStyle.width40}>Jenis</TextBase.XL>
                    <TextBase.XL>
                      : {confirmationModalCtrl.product_type}
                    </TextBase.XL>
                  </View>
                </View>
              )}
            </ConfirmationModal>
          )}
        </View>
      </View>
    </Base>
  );
};

export default PourOutScanner;
