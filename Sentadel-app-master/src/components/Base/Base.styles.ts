import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  scrollView: {
    flexGrow: 1
  },
  noScrollView: {
    flex: 1
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 70,
    backgroundColor: Colors.base.oxfordBlue
  },
  headerTitleText: {
    color: Colors.base.fullWhite,
    flex: 1
  },
  drawerToogleButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 30,
    height: 30,
    borderRadius: 15
  }
});

export default styles;
