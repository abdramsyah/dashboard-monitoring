import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 20, flex: 1 },

  //header
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

  // body
  contentContainerStyle: {
    flexGrow: 1,
    paddingBottom: 50
  },

  // other
  textWhite: { color: Colors.text.fullWhite },
  textWhite600: {
    fontWeight: '600',
    color: Colors.text.fullWhite
  }
});
