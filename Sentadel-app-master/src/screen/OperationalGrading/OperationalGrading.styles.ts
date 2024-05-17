import Colors from '@sentadell-src/config/Colors';
import { screenHeight, screenWidth } from '@sentadell-src/config/Sizes';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    width: screenWidth - 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    rowGap: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean,
    alignItems: 'center'
  },
  inputContainer: {
    width: 150
  },

  container: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },

  contentContainer: {
    backgroundColor: Colors.base.white,
    height: screenHeight * 0.8,
    width: screenWidth,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 2
  }
});
