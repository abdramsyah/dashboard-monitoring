import { Dimensions, PixelRatio } from 'react-native';

export const { width: screenWidth, height: screenHeight } =
  Dimensions.get('window');

export const screenWidthPx = PixelRatio.getPixelSizeForLayoutSize(screenWidth);
export const screenHeightPx =
  PixelRatio.getPixelSizeForLayoutSize(screenHeight);
