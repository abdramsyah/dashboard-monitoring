import Colors from '@sentadell-src/config/Colors';
import { StyleSheet, ViewStyle } from 'react-native';

const queueGroupStatus: ViewStyle = {
  paddingVertical: 2,
  paddingHorizontal: 5,
  borderRadius: 10
};

export default StyleSheet.create({
  // item
  cardHeader: {
    padding: 10,
    backgroundColor: Colors.base.oxfordBlue90,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 5
  },
  cardHeader1: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalBucket: {
    flexDirection: 'row',
    width: 70,
    alignItems: 'center',
    gap: 5
  },

  // nest card
  nestCardContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean
  },
  nestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center'
  },
  nestCardNumber: { width: 50, fontWeight: '700' },
  nestCardContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    justifyContent: 'space-between'
  },

  goodsAndInvoiceStatus: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10
  },

  // status nest card
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

  // other
  textWhite600: {
    fontWeight: '600',
    color: Colors.text.fullWhite
  },
  gap16: { gap: 16 },
  fw600: { fontWeight: '700' },
  textWhite: { color: Colors.text.fullWhite },
  horizontalLine: {
    height: 1,
    backgroundColor: Colors.border.purpleOcean
  }
});
