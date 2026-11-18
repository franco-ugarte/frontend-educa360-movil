import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 22 : 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  // Dock flotante que abarca casi todo el ancho del celular.
  dockBar: {
    width: '94%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#1E1B4B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  activeBorder: {
    flex: 1,
    maxWidth: 90,
    padding: 1.8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeInner: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 7,
    borderRadius: 14.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5F348F',
  },
  inactiveTab: {
    flex: 1,
    maxWidth: 90,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginHorizontal: 2,
    gap: 3,
  },
  inactiveLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
