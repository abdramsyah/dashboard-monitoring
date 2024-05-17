import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  unfocusedArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)' // light blue
  },
  focusedArea: {
    flexDirection: 'row'
  },
  clearArea: {
    backgroundColor: 'transparent'
  }
});
