import Colors from '@sentadell-src/config/Colors';
import { screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  gradingQueueCardChip: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center'
  },
  headerContainer: {
    flexDirection: 'row',
    gap: 5,
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  bodyContainer: {
    paddingHorizontal: 5,
    paddingVertical: 3
  },
  referenceDataContainer: {
    flexDirection: 'row',
    gap: 5,
    borderTopColor: Colors.border.purpleOcean,
    borderTopWidth: 1,
    paddingTop: 5,
    marginTop: 5
  },
  contentDataContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  contentDataStatus: { color: Colors.text.fullWhite, fontWeight: '700' },
  contentDataNumCell: { width: 80 },
  contentDataOtherContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  retryButton: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    padding: 20
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    backgroundColor: Colors.base.fullWhite,
    padding: 10
  },

  xButton: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    top: 18
  },
  fw700: { fontWeight: '700' },
  gap5: { gap: 5 },
  width80: { width: 80 }
});
