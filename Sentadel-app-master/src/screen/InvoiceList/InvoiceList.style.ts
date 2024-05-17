import Colors from '@sentadell-src/config/Colors';
import { screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    width: screenWidth - 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    rowGap: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10
  },
  inputContainer: {
    width: 150
  },

  // FlatList
  contentContainerStyle: {
    gap: 10,
    width: screenWidth,
    paddingHorizontal: 12
  },

  // Render Item Card
  invoiceContainer: {
    borderRadius: 10,
    paddingTop: 35,
    overflow: 'hidden',
    backgroundColor: Colors.base.fullWhite,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowColor: Colors.base.fullBlack,
    shadowOpacity: 0.1,
    elevation: 4,
    margin: 4
  },
  invoiceHeaderContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.base.oxfordBlue90,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  invoiceContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    justifyContent: 'space-between'
  },
  contentRow: {
    width: '46%',
    flexDirection: 'row'
  },
  invoiceStatusChip: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10
  },

  // other
  textWhite: { color: Colors.text.fullWhite }
});
