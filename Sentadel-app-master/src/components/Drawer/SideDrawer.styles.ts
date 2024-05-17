import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 24
  },
  roleText: { color: Colors.base.fullWhite, fontWeight: '700' },
  menuRoleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.base.white70,
    gap: 20,
    rowGap: 20
  },
  menuContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.base.oxfordBlue,
    borderRadius: 16,
    minHeight: 40,
    minWidth: 200,
    maxWidth: 200,
    padding: 12,
    alignItems: 'center',
    gap: 5
  },
  menuText: {
    color: Colors.base.fullWhite,
    fontWeight: '600',
    flex: 1
  },

  // profile section
  profileSection: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.base.oxfordBlue,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  userSection: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  useBadge: {
    width: 50,
    height: 50,
    backgroundColor: Colors.base.white10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50
  },
  logoutButton: {
    backgroundColor: Colors.base.white10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },

  // other
  textWhite700: {
    fontWeight: '700',
    color: Colors.text.fullWhite
  }
});
