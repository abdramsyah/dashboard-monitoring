import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  gradingQueueCard: {
    minWidth: 150,
    maxWidth: 250,
    minHeight: 130,
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    margin: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowColor: Colors.base.fullBlack,
    shadowOpacity: 0.1,
    elevation: 6
  },
  gradingQueueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 2,
    gap: 10
  },
  gradingQueueCardChipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingVertical: 4,
    rowGap: 4,
    gap: 4
  },
  gradingQueueCardChip: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8
  }
});
