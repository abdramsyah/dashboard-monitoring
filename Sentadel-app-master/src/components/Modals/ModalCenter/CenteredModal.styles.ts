import Colors from '@sentadell-src/config/Colors';
import { screenHeight, screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backdrop: {
    position: 'absolute',
    flexDirection: 'column',
    backgroundColor: Colors.base.black40,
    width: screenWidth,
    height: screenHeight
  },
  upperContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.base.fullWhite,
    maxWidth: screenWidth - 40,
    alignItems: 'center',
    borderRadius: 10,
    padding: 16
  }
});
