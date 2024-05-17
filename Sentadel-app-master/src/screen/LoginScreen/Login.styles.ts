import Colors from '@sentadell-src/config/Colors';
import { screenHeight } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    flex: 1,
    height: screenHeight
  },
  loginArea: {
    backgroundColor: Colors.base.fullWhite,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 60,
    gap: 30
  },
  gap20: {
    gap: 20
  },
  buttonContainer: {
    marginTop: 50
  }
});
