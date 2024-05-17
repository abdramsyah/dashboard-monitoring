import Colors from '@sentadell-src/config/Colors';
import { screenHeight } from '@sentadell-src/config/Sizes';
import { StyleSheet, ViewStyle } from 'react-native';

const queueGroupStatus: ViewStyle = {
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 10
};

export default StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 20
  },
  headerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    rowGap: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean
  },
  filter: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    backgroundColor: Colors.base.cornflowerBlue,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  sort: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    backgroundColor: Colors.base.cornflowerBlue,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  flatListStyle: {
    marginBottom: 100,
    marginTop: 10,
    height: screenHeight * 0.8
    // flex: 1
  },
  flatListContentContainer: {
    paddingVertical: 20,
    gap: 20,
    flexGrow: 1
  },

  // Queue Group
  queueGroupContainer: {
    padding: 8,
    gap: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean
  },
  queueGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  queueGroupStatusApproved: {
    ...queueGroupStatus,
    backgroundColor: Colors.base.greenApproved
  },
  queueGroupStatusRejected: {
    ...queueGroupStatus,
    backgroundColor: Colors.base.redRejected
  },
  queueGroupStatusOnProgress: {
    ...queueGroupStatus,
    backgroundColor: Colors.base.blueOnProgress
  },
  horizontalLine: {
    height: 1,
    flex: 1,
    backgroundColor: Colors.border.purpleOcean
  },
  queueGroupContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    rowGap: 10
  },

  // Text
  textWhite: { color: Colors.text.fullWhite },
  fw600: { fontWeight: '600' },
  rowContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  }
});
