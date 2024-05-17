import Colors from '@sentadell-src/config/Colors';
import { screenHeight, screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    rowGap: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean,
    alignItems: 'center'
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  scanInputContainer: { width: 0, height: 0, overflow: 'hidden' },

  // form container
  formContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.base.white,
    height: screenHeight * 0.62,
    width: screenWidth,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 2
  },
  // barcode sales
  barcodeSalesChip: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: Colors.base.greenApproved
  },
  barcodeSalesContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 10
  },

  textGray600: {
    color: Colors.text.darkGray,
    fontWeight: '600'
  },
  textGray700: {
    color: Colors.text.darkGray,
    fontWeight: '700'
  },
  textWhite800: {
    color: Colors.text.fullWhite,
    fontWeight: '800'
  }
});
