import {
  CameraHighlights,
  Barcode,
  computeHighlights,
  convertVisionCameraCodeToBarcode
} from '@mgcrea/vision-camera-barcode-scanner';
import {
  screenHeight,
  screenHeightPx,
  screenWidthPx
} from '@sentadell-src/config/Sizes';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { LayoutChangeEvent, View, ViewStyle, PixelRatio } from 'react-native';
import {
  Camera,
  CameraProps,
  runAtTargetFps,
  useCameraDevices,
  useCameraFormat,
  useCodeScanner
} from 'react-native-vision-camera';
import Sound from 'react-native-sound';
import styles from './ScannerView.styles';
import { LOG } from '@sentadell-src/utils/commons';
import { showMessage } from 'react-native-flash-message';

interface ScannerViewProps {
  cameraProps?: Omit<
    CameraProps,
    'codeScanner' | 'isActive' | 'device' | 'format' | 'style'
  >;
  containerStyle?: ViewStyle;
  onCodeScanned: (codes: Omit<Barcode, 'native'>[]) => void;
  scanInterval?: number;
  scanRegion?: { width: number; height: number };
  isActive?: boolean;
}

const soundName = 'scan_sound_mp3.mp3';
const scanSound = new Sound(soundName, Sound.MAIN_BUNDLE, error => {
  if (error) {
    LOG.error('scanSound - error', error);
    showMessage({
      type: 'danger',
      message: 'Gagal memuat file audio scan!,' + error
    });
  }

  scanSound.setVolume(1);
});

const ScannerView = (props: ScannerViewProps) => {
  const {
    cameraProps,
    containerStyle,
    onCodeScanned,
    scanInterval = 1000,
    scanRegion,
    isActive = true
  } = props;

  const [barcodes, setBarcodes] = useState<Omit<Barcode, 'native'>[]>([]);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [containerLayout, setContainerLayout] = useState({
    width: 0,
    height: 0
  });
  const [ready, setReady] = useState(true);

  // const previouseBarcodes = usePrevious<Omit<Barcode, 'native'>[]>(barcodes);
  const previouseBarcodes = useRef<Omit<Barcode, 'native'>[]>(barcodes);
  const devices = useCameraDevices();
  const device = devices.find(({ position }) => position === 'back');
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } }
  ]);

  const getScanRegionPosition = useMemo(() => {
    const containerHeight =
      (PixelRatio.getPixelSizeForLayoutSize(containerLayout.height) * 1280) /
      screenHeightPx;
    const containerWidth =
      (PixelRatio.getPixelSizeForLayoutSize(containerLayout.width) * 720) /
      screenWidthPx;
    const scanRegionHeight =
      (PixelRatio.getPixelSizeForLayoutSize(scanRegion?.height || 0) * 1280) /
      screenHeightPx;
    const scanRegionWidth =
      (PixelRatio.getPixelSizeForLayoutSize(scanRegion?.width || 0) * 720) /
      screenWidthPx;
    const vertical = (containerHeight - scanRegionHeight) / 2 - 50;
    const horizontal = (containerWidth - scanRegionWidth) / 2 - 50;
    const top = Math.floor(0 + vertical);
    const bottom = Math.floor(containerHeight - vertical);
    const left = Math.floor(containerWidth - horizontal);
    const right = Math.floor(0 + horizontal);

    // LOG.warn(`containerHeight`, containerHeight);
    // LOG.warn(`containerWidth`, containerWidth);
    // LOG.warn(`vertical`, vertical);
    // LOG.warn(`horizontal`, horizontal);

    return { top, bottom, left, right };
  }, [containerLayout]);

  const containerOnLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setContainerLayout({ width, height });
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: codes => {
      runAtTargetFps(5, () => {
        if (ready) {
          // LOG.info('codes', codes);
          if (codes.length) {
            const okBarcode: Omit<Barcode, 'native'>[] = [];

            for (let i = 0; i <= codes.length; i++) {
              const data = codes[i];

              if (data?.frame) {
                const barcode = convertVisionCameraCodeToBarcode(data);
                const { top, bottom, left, right } = getScanRegionPosition;

                // LOG.warn(`data`, data);
                const isInsideRegionOfInterest = barcode.cornerPoints.every(
                  cp =>
                    cp.x >= top &&
                    cp.x <= bottom &&
                    cp.y >= right &&
                    cp.y <= left
                );

                if (isInsideRegionOfInterest) {
                  okBarcode.push(barcode);
                  break;
                }
              }
            }

            if (okBarcode.length) {
              if (previouseBarcodes.current.length) {
                const hasChanged =
                  JSON.stringify(okBarcode.map(e => e.value)) !==
                  JSON.stringify(previouseBarcodes.current.map(e => e.value));

                if (!hasChanged) return;
              }

              onCodeScanned(okBarcode);
              previouseBarcodes.current = okBarcode;
              setReady(false);

              scanSound.play(success => {
                if (success) {
                  LOG.info('scan sound success');
                } else {
                  LOG.warn('scan sound failed');
                }
              });
            }
            setBarcodes(okBarcode);
          } else {
            setBarcodes([]);
          }
        }
      });
    }
  });

  const highlights = computeHighlights(
    barcodes,
    {
      width: format?.videoWidth || 1280,
      height: format?.videoHeight || 720,
      orientation: 'portrait'
    },
    layout,
    'cover'
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setLayout({ width, height });
  }, []);

  const readyCallback = useCallback(() => {
    setReady(true);
    setBarcodes([]);
  }, []);

  useEffect(() => {
    const timeout = ready ? null : setTimeout(readyCallback, scanInterval);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [ready, scanInterval]);

  if (!device || !format) {
    return null;
  }

  return (
    <View
      style={[
        {
          position: 'relative'
        },
        containerStyle
      ]}
      onLayout={containerOnLayout}>
      <Camera
        device={device}
        resizeMode={'cover'}
        codeScanner={codeScanner}
        onLayout={onLayout}
        // isActive={false}
        isActive={isActive}
        {...cameraProps}
        style={{ height: screenHeight }}
      />
      <CameraHighlights highlights={highlights} color="peachpuff" />
      {scanRegion && (
        <View
          style={{
            position: 'absolute',
            height: containerStyle && containerStyle['height'],
            width: (containerStyle && containerStyle['width']) || '100%'
          }}>
          <View style={styles.unfocusedArea} />
          <View
            style={[
              styles.focusedArea,
              {
                height: scanRegion && scanRegion['height']
              }
            ]}>
            <View style={styles.unfocusedArea} />
            <View style={[styles.clearArea, scanRegion]} />
            <View style={styles.unfocusedArea} />
          </View>

          <View style={styles.unfocusedArea} />
        </View>
      )}
    </View>
  );
};

export default ScannerView;
