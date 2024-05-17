import { View } from 'react-native';
import React from 'react';
import {
  Camera,
  CameraProps,
  useCameraDevice
} from 'react-native-vision-camera';
import TextBase from '../Text/TextBase';

type CameraViewProps = Omit<CameraProps, 'device' | 'isActive'>;

const CameraView = (props: CameraViewProps) => {
  const device = useCameraDevice('back');

  if (device == null) return <TextBase.XL>No Camera Detected</TextBase.XL>;
  return (
    <View>
      <Camera device={device} isActive={true} {...props} />
    </View>
  );
};

export default CameraView;
