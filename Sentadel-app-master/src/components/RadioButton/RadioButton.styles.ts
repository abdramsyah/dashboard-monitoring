import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default (outerRadioSize: number, innerRadioSize: number) =>
  StyleSheet.create({
    outerContainer: {
      height: outerRadioSize,
      width: outerRadioSize,
      borderRadius: outerRadioSize / 2,
      borderWidth: 1,
      borderColor: Colors.base.greenApproved,
      backgroundColor: 'transparent'
    },
    innerContainer: {
      height: innerRadioSize,
      width: innerRadioSize,
      borderRadius: innerRadioSize / 2,
      backgroundColor: Colors.base.greenApproved
    }
  });
