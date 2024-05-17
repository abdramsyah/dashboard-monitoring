import { TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalWeighScan.styles';
import ScannerView from '@sentadell-src/components/ScannerView/ScannerView';
import { serialNumberPattern } from '@sentadell-src/utils/regexp';
import { tcpOnReadDataFromScale } from '@sentadell-src/utils/commons';
import { showMessage } from 'react-native-flash-message';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import {
  flexiStyle,
  fwStyle,
  marginStyle
} from '@sentadell-src/utils/moderateStyles';
import lDict from '@sentadell-src/utils/lDict';
import {
  GoodsDetailModel,
  SetWeightModel,
  WeightConfirmationModalCtrlType
} from '@sentadell-src/types/weigh';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEY } from '@sentadell-src/apis/queries/key';
import { getGoodsDetail, setWeight } from '@sentadell-src/apis/queries/fetch';
import {
  ErrorResponseType,
  SuccessResponseType
} from '@sentadell-src/types/global';
import { GetGoodsModel } from '@sentadell-src/types/goods';
import TcpSocket from 'react-native-tcp-socket';
import { SettingSvg } from '@sentadell-src/config/Svgs';
import SetupModal from '@sentadell-src/components/Screen/OperationalWeigh/SetupModal/SetupModal';
import { useGetScaleServer } from '@sentadell-src/stores/realm/actions/scaleServer';
import Button from '@sentadell-src/components/Button/Button';
import { Barcode } from '@mgcrea/vision-camera-barcode-scanner';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_WEIGH_SCAN
>;

interface OperationalWeighScanScreenProps {
  navigation: NavigationProps;
}

const OperationalWeighScanScreen: React.FC<OperationalWeighScanScreenProps> = (
  props: OperationalWeighScanScreenProps
) => {
  const {} = props;

  const scaleServer = useGetScaleServer();
  const client = new TcpSocket.Socket();

  const [confirmationModalCtrl, setConfrimationModalCtrl] =
    useState<WeightConfirmationModalCtrlType>({
      open: false
    });
  const [isSetupModalOpen, setSetupModalOpen] = useState(false);
  const [weightInfo, setWeightInfo] = useState(0);
  const [savedWeight, setSavedWeight] = useState(0);

  const onSuccessGetGoodsDetail = (
    data: SuccessResponseType<GetGoodsModel, string>
  ) => {
    setConfrimationModalCtrl(state => ({
      ...state,
      data: {
        farmer_name: data.data.data.farmer_name,
        coordinator_name: data.data.data.coordinator_name,
        product_type: data.data.data.product_type,
        serial_number: data.data.data.serial_number,
        sales_code: data.data.data.grading_data[0]?.sales_code,
        gross_weight: data.data.data.weigh_data[0]?.gross_weight,
        goods_id: data.data.data.goods_id
      }
    }));
  };

  const onErrorGetGoodsDetail = (err: ErrorResponseType<string>) => {
    showMessage({
      type: 'danger',
      message:
        'Gagal, terjadi kesalahan! ' + (err.response?.data.message || err)
    });
  };

  const getGoodsDetailMt = useMutation({
    mutationKey: [MUTATION_KEY.GET_GOODS_DETAIL],
    mutationFn: getGoodsDetail,
    onSuccess: onSuccessGetGoodsDetail,
    onError: onErrorGetGoodsDetail
  });

  const onSuccessSetWeight = (
    data: SuccessResponseType<unknown, SetWeightModel>
  ) => {
    showMessage({
      type: 'success',
      message: data.data.message || 'Sukses'
    });
    setSavedWeight(0);
  };

  const onErrorSetWeight = (err: ErrorResponseType<SetWeightModel>) => {
    showMessage({
      type: 'danger',
      message:
        'Gagal, terjadi kesalahan! ' + (err.response?.data.message || err)
    });
    setSavedWeight(0);
  };

  const setWeightMt = useMutation({
    mutationKey: [MUTATION_KEY.SET_WEIGHT],
    mutationFn: setWeight,
    onSuccess: onSuccessSetWeight,
    onError: onErrorSetWeight
  });

  const onScanned = (codes: Omit<Barcode, 'native'>[]) => {
    try {
      const isSerialNumber = serialNumberPattern.test(codes[0].value || '');

      if (isSerialNumber) {
        setConfrimationModalCtrl({ open: true });
        getGoodsDetailMt.mutate(codes[0].value || '');
      } else {
        throw 'Bukan nomor seri';
      }
    } catch (err) {
      showMessage({
        type: 'warning',
        message: 'Terjadi kesalahan. ' + err
      });
    }
  };

  useEffect(() => {
    client.connect(
      {
        host: scaleServer?.host,
        port: scaleServer?.portList[scaleServer?.currPortIdx] || 0
      },
      () => {
        client.write('Write into server');
      }
    );

    client.on('data', (buffer: Buffer | string) => {
      tcpOnReadDataFromScale(buffer, {
        onSuccess: gw => setWeightInfo(gw),
        onError: err => {
          showMessage({
            type: 'danger',
            message: 'Gagal, terjadi kesalahan! ' + err
          });
          setWeightInfo(0);
        }
      });
    });

    return () => {
      client.destroy();
    };
  }, [scaleServer]);

  const renderModal = () => {
    return (
      <>
        {isSetupModalOpen && (
          <SetupModal
            visible={isSetupModalOpen}
            onClose={() => setSetupModalOpen(false)}
            onPreSubmit={() => {
              setSetupModalOpen(false);
            }}
            onSubmit={() => {
              //
            }}
          />
        )}
      </>
    );
  };

  const renderInformation = () => {
    if (confirmationModalCtrl.data) {
      const data = confirmationModalCtrl.data;

      return (
        <View style={flexiStyle.flexRow}>
          <View style={styles.goodsInfo}>
            {Object.keys(confirmationModalCtrl.data).map((item: string) => {
              const key = item as keyof GoodsDetailModel;

              if (key === 'goods_id') return;

              const value =
                (key === 'gross_weight'
                  ? (data[key] || 0) / 1000
                  : data[key]) || '-';

              return (
                <View key={key} style={styles.goodsInfoRow}>
                  <TextBase.L ellipsizeMode="tail" style={fwStyle[600]}>
                    {lDict[key.toUpperCase()]?.replaceAll('Nama ', '')}
                  </TextBase.L>
                  <TextBase.L>{value}</TextBase.L>
                </View>
              );
            })}
          </View>
          <View style={styles.actionContainer}>
            <View style={styles.weightInfo}>
              <TextBase.L style={fwStyle[700]}>
                {savedWeight || weightInfo}
              </TextBase.L>
            </View>
            <Button
              title={'Kunci'}
              isLoading={setWeightMt.isPending}
              disabled={!weightInfo}
              onPress={() => setSavedWeight(weightInfo)}
            />
            <Button
              title={!!data.gross_weight ? 'Update data' : 'Kirim data'}
              isLoading={setWeightMt.isPending}
              disabled={!savedWeight}
              onPress={() =>
                setWeightMt.mutate({
                  goods_id: data.goods_id || 0,
                  gross_weight: savedWeight * 1000
                })
              }
            />
          </View>
        </View>
      );
    }
  };

  return (
    <Base headerTitle={'Timbangan (Scan)'} noScroll>
      <View style={styles.container}>
        {/* <View style={styles.informationContainer}>
          <View style={styles.informationHeader}>
            <TextBase.XL style={fwStyle[700]}>Informasi</TextBase.XL>
            <TouchableOpacity
              style={marginStyle.mr15}
              onPress={() => setSetupModalOpen(true)}>
              <SettingSvg stroke={Colors.base.fullBlack} />
            </TouchableOpacity>
          </View>
          {renderInformation()}
        </View>
        <View style={styles.scannerContainer}>
          <View style={styles.scannerInnerContaienr}>
            <ScannerView
              onCodeScanned={onScanned}
              scanInterval={5000}
              scanRegion={{ width: 400, height: 400 }}
              containerStyle={{ height: 550 }}
            />
          </View>
        </View> */}
        <View style={styles.scannerContainer}>
          <View style={styles.scannerInnerContaienr}>
            <ScannerView
              onCodeScanned={onScanned}
              scanInterval={5000}
              scanRegion={{ width: 400, height: 400 }}
              containerStyle={{ height: 550 }}
            />
          </View>
        </View>
        <View style={styles.informationContainer}>
          <View style={styles.informationHeader}>
            <TextBase.XL style={fwStyle[700]}>Informasi</TextBase.XL>
            <TouchableOpacity
              style={marginStyle.mr15}
              onPress={() => setSetupModalOpen(true)}>
              <SettingSvg stroke={Colors.base.fullBlack} />
            </TouchableOpacity>
          </View>
          {renderInformation()}
        </View>
      </View>
      {renderModal()}
    </Base>
  );
};

export default OperationalWeighScanScreen;
