import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.text.fullWhite,
    fontWeight: '600',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36
  },
  solidBlue: {
    backgroundColor: Colors.button.blue,
    borderWidth: 1,
    borderColor: Colors.button.blue
  },
  solidRed: {
    backgroundColor: Colors.button.red,
    borderWidth: 1,
    borderColor: Colors.button.red
  },
  textSolid: { color: Colors.text.fullWhite },
  solidDisabled: { backgroundColor: Colors.button.disabled },
  textDisabled: { color: Colors.text.darkGray },
  outlinedRed: {
    borderWidth: 1,
    borderColor: Colors.button.red,
    backgroundColor: Colors.button.fullWhite
  },
  textOutlineRed: { color: Colors.button.red },
  outlinedDisabled: {
    borderWidth: 1,
    borderColor: Colors.text.darkGray,
    backgroundColor: Colors.button.disabled
  }
});
