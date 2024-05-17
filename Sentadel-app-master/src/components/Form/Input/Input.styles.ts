import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  outlinedContainer: {
    height: 35.5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: Colors.base.fullWhite,
    borderColor: Colors.border.purpleOcean
  },
  inputContainer: {
    marginVertical: 0,
    borderRadius: 5,
    backgroundColor: Colors.base.fullWhite
  },
  disabledContainer: {
    backgroundColor: Colors.base.black10
  },
  secureButton: {
    height: '100%',
    width: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  errMessageText: {
    color: Colors.border.dangerWarn
  },
  input: {
    fontSize: 14,
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    textAlign: 'left',
    textAlignVertical: 'center',
    alignSelf: 'stretch'
  }
});

export default styles;
