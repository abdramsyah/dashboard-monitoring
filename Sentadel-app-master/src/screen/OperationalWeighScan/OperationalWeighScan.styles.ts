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
  container: { flex: 1, justifyContent: 'space-between', gap: 20 },

  // information
  informationContainer: {
    paddingHorizontal: 16,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    elevation: 2,
    backgroundColor: Colors.base.white,
    flex: 1,
    paddingTop: 12,
    paddingBottom: 30
  },

  informationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  goodsInfo: {
    flex: 1,
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 15
  },
  goodsInfoRow: {
    width: (screenWidth - 32) / 4,
    minHeight: 20
  },
  actionContainer: {
    width: (screenWidth - 32) / 4,
    padding: 12,
    height: '100%',
    gap: 16
  },
  weightInfo: {
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  actionButton: {
    backgroundColor: Colors.button.blue,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  scannerContainer: {
    backgroundColor: Colors.base.white,
    height: screenHeight * 0.65,
    width: screenWidth,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    overflow: 'hidden'
  },
  scannerInnerContaienr: {
    borderRadius: 20,
    overflow: 'hidden'
  },

  // other
  font700white: {
    fontWeight: '700',
    color: Colors.text.fullWhite
  }
});
