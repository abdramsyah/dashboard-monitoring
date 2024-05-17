import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center'
  },
  scanModeCard: {
    backgroundColor: Colors.base.oxfordBlue80,
    height: 200,
    width: 180,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  scanModeTitle: {
    fontWeight: '600',
    color: Colors.text.fullWhite
  }
});
