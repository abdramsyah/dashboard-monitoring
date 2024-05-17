import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center'
  },
  headerNumCell: {
    width: 25,
    textAlign: 'center',
    color: Colors.text.fullWhite,
    fontWeight: '700'
  },
  headerCell: {
    textAlign: 'center',
    color: Colors.text.fullWhite,
    fontWeight: '700'
  },
  contentRowContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 4.5,
    alignItems: 'center',
    minHeight: 40
  },
  contentNumCell: {
    textAlign: 'right',
    width: 25
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%'
  }
});
