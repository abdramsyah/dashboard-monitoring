import Colors from '@sentadell-src/config/Colors';
import { screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: Colors.base.black40,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  upperContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.base.fullWhite,
    maxWidth: screenWidth - 40,
    alignItems: 'center',
    borderRadius: 10,
    padding: 16
  },
  titleText: {
    fontWeight: '600'
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between'
  }
});
