import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8
  },
  headerTitle: {
    fontWeight: '600'
  },
  plusButton: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.purpleOcean,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.base.oxfordBlue90
  },
  horizontalLine: {
    marginVertical: 8,
    height: 1,
    backgroundColor: Colors.border.purpleOcean
  },
  formContainer: {
    flexDirection: 'column',
    gap: 16,
    flex: 1
  }
});
