import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.base.fullWhite,
    minHeight: 33,
    zIndex: 1,
    borderColor: Colors.border.purpleOcean,
    borderRadius: 5,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 5,
    gap: 10,
    paddingVertical: 5
  },

  dropdownLabelListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  dropdownLabelContainer: {
    padding: 5,
    backgroundColor: '#ddd',
    borderRadius: 8
  },

  xButton: { position: 'absolute', right: 20, top: 18 },
  bgBlack10: { backgroundColor: Colors.base.black10 },
  fw700: { fontWeight: '700' },
  errMessageText: {
    color: Colors.border.dangerWarn
  },

  // item options
  item: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: Colors.base.gainsboro
  },
  firstItemBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  itemBorder: {
    borderBottomWidth: 1
  }
});
