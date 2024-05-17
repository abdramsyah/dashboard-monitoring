import {
  // BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
  Exception,
  NotFoundException,
  Result,
} from "@zxing/library";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import deepEqual from "@/components/BarcodeScannerCamera/utils/deepEqual";
import FlashLight from "@/assets/svg/icon/flashlight";
import styles from "./style.module.scss";

type useQrScannerProps = {
  onResult: (val: Result) => void;
  onError: (err: Exception) => void;
  scanDelay?: number;
  constraints: MediaTrackConstraints;
  hints?: Map<DecodeHintType, any>;
  deviceId?: string;
  torch: boolean;
};

export const useQrScanner = (props: useQrScannerProps) => {
  const { onResult, onError, scanDelay, hints, deviceId, torch } = props;

  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const videoRef = useRef(null);

  const [constraints, setConstraints] = useState(props.constraints);

  const reader = useMemo(
    () => new BrowserMultiFormatReader(hints, scanDelay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDecode = useCallback((result?: Result, error?: Exception) => {
    if (result) onResultRef.current(result);
    if (error && !(error instanceof NotFoundException))
      onErrorRef.current(error);
  }, []);

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment",
      },
    })
    .then((stream) => {
      const video = document.querySelector("video");
      let track: MediaStreamTrack;
      if (video) {
        video.srcObject = stream;

        // get the active track of the stream
        track = stream.getVideoTracks()[0];

        const imageCapture = new ImageCapture(track);

        imageCapture.getPhotoCapabilities().then(onCapabilitiesReady);
      }

      function onCapabilitiesReady(asd: PhotoCapabilities) {
        try {
          track.applyConstraints({
            advanced: [{ torch }],
          });
        } catch (err) {
          console.log(err);
        }
      }
    })
    .catch((err) => console.error("getUserMedia() failed: ", err));

  const startDecoding = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (deviceId) {
        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          onDecode
        );
      } else {
        let newConstraints = {
          audio: false,
          video: constraints,
        };

        await reader.decodeFromConstraints(
          newConstraints,
          videoRef.current,
          onDecode
        ).then;
      }
    } catch (error) {
      onErrorRef.current(error as Exception);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reader, deviceId, constraints, onDecode]);

  const stopDecoding = useCallback(() => {
    reader.reset();
  }, [reader]);

  useEffect(() => {
    const isEqual = deepEqual(props.constraints, constraints);

    if (!isEqual) {
      setConstraints(props.constraints);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.constraints]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    (async () => {
      await startDecoding();
    })();
    return () => {
      stopDecoding();
    };
  }, [startDecoding, stopDecoding]);

  return { ref: videoRef, start: startDecoding, stop: stopDecoding };
};

const defaultConstraints = {
  facingMode: "environment",
  // advanced: [{ torch: true }],
};

type BarcodeScannerCameraProps = {
  onResult: (val: Result) => void;
  onError: (val: Exception) => void;
  timeBetweenDecodingAttempts?: number;
  videoStyle?: CSSProperties;
  className?: string;
};

export const BarcodeScannerCamera = ({
  onResult = () => {},
  onError = () => {},
  timeBetweenDecodingAttempts = 300,
  videoStyle,
  className,
}: BarcodeScannerCameraProps) => {
  // const hints: Map<DecodeHintType, any> = new Map([
  //   [DecodeHintType.POSSIBLE_FORMATS, BarcodeFormat.QR_CODE],
  // [DecodeHintType.POSSIBLE_FORMATS, BarcodeFormat.AZTEC],
  // [DecodeHintType.POSSIBLE_FORMATS, BarcodeFormat.DATA_MATRIX],
  // [DecodeHintType.POSSIBLE_FORMATS, BarcodeFormat.PDF_417],
  // ]);
  const [torch, setTorch] = useState(true);

  const height = window.innerHeight;
  const width = window.innerWidth;

  const { ref } = useQrScanner({
    onResult,
    onError,
    constraints: defaultConstraints,
    // hints: null,
    scanDelay: timeBetweenDecodingAttempts,
    torch,
  });
  return (
    <div className={styles.cameraContainer}>
      <video
        ref={ref}
        muted
        style={{
          ...videoStyle,
        }}
        className={className}
        width={width}
        height={height}
      />
      <div
        className={styles.flashButton}
        onClick={() => setTorch((state) => !state)}
      >
        <FlashLight className={styles.flashIcon} height={20} width={20} />
      </div>
    </div>
  );
};
