import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  disposableContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.purpleOcean
  },
  disposeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 2
  },
  indexContainer: {
    minWidth: 30,
    flexDirection: 'column'
  },
  indexContainer2: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  indexNumber: {
    color: Colors.text.fullBlack
  },
  forms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    flex: 1
  }
});
