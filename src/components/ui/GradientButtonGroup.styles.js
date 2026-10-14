import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12, // Se adapta dinámicamente según el sistema
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  // Barra ancha que abarca casi todo el ancho del celular
  dockBar: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
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
        elevation: 8,
      },
    }),
  },
  activeBorder: {
    flex: 1,
    maxWidth: 90,
    padding: 1.8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  activeInner: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    borderRadius: 14.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5F348F',
  },
  inactiveTab: {
    flex: 1,
    maxWidth: 90,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginHorizontal: 4,
    gap: 4,
  },
  inactiveLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});