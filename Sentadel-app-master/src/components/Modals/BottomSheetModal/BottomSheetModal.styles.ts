import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Colors.base.fullWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  root: {
    backgroundColor: Colors.base.black10,
    flex: 1,
    justifyContent: 'flex-end'
  },
  rootMask: {
    backgroundColor: Colors.base.black40,
    flex: 1,
    justifyContent: 'flex-end'
  },
  panGesture: {
    height: 30,
    width: '100%',
    backgroundColor: Colors.base.fullWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gap: {
    width: 42,
    backgroundColor: Colors.base.coolGrey11,
    marginTop: 8,
    borderRadius: 10
  }
});
