import Colors from '@sentadell-src/config/Colors';
import { screenHeight, screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', gap: 20 },

  // scanner
  headerContainer: {
    paddingHorizontal: 16,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    elevation: 2,
    backgroundColor: Colors.base.white,
    flex: 1,
    paddingTop: 12,
    paddingBottom: 30
  },

  scannerInnerContaienr: {
    borderRadius: 20,
    overflow: 'hidden'
  },

  groupingDataContainer: {
    backgroundColor: Colors.base.white,
    height: screenHeight * 0.75,
    width: screenWidth,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 2,
    overflow: 'hidden',
    gap: 8
  },

  // other
  font700white: {
    fontWeight: '700',
    color: Colors.text.fullWhite
  }
});
