import Colors from '@sentadell-src/config/Colors';
import { screenHeight, screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: Colors.base.white,
    flex: 1
  },
  cameraContainer: {
    height: 400,
    width: screenWidth * 0.8,
    borderRadius: 20,
    overflow: 'hidden'
  },
  cameraStyles: {
    height: screenHeight,
    width: screenWidth
  },

  // Content Section
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: screenWidth,
    height: screenHeight * 0.43,
    elevation: 2,
    backgroundColor: Colors.base.fullWhite
  },
  contentContainerScrollView: {
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  scannedBarcodeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  // ConfirmationModalChild
  cmChildContainer: {
    gap: 5,
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 20
  },
  cmContentRowContainer: {
    flexDirection: 'row',
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBlockColor: Colors.border.purpleOcean
  },

  // other
  textWhite: { color: Colors.text.fullWhite }
});
