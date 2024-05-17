import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // Header
  headerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 20
  },
  headerRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    paddingRight: 10
  },

  // Table Footer
  tableFooterContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.base.oxfordBlue,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  totalSpan: {
    width: '75%',
    paddingHorizontal: 5,
    paddingVertical: 4
  },
  totalText: {
    textAlign: 'center',
    color: Colors.text.fullWhite,
    fontWeight: '600'
  },
  totalValueWrapper: {
    width: '25%',
    padding: 1
  },
  totalValueContainer: {
    backgroundColor: Colors.base.fullWhite,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderBottomRightRadius: 9.5
  },
  totalValueText: {
    textAlign: 'right',
    fontWeight: '600'
  },

  // Bottom Information
  bottomRowContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5
  },
  bottomRowTitle: { width: 120, fontWeight: '700' },
  bottomRowMiddle: { flex: 3 },
  bottomRowValue: { flex: 2, textAlign: 'right' },

  // Repayment
  repaymentContainer: {
    paddingHorizontal: 5,
    gap: 5
  },
  repaymentLoanCode: { width: 120 },

  // Received Value
  receivedValue: { flex: 1, textAlign: 'right' },

  // other
  textWhite: { color: Colors.text.fullWhite },
  horizontalLine: {
    height: 1,
    backgroundColor: Colors.border.purpleOcean
  },
  textAlignRight: { textAlign: 'right' }
});
