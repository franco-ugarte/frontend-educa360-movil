import { StyleSheet } from 'react-native';
import { colors, radius, shadowSoft } from '../../theme';

/** Estilos compartidos por las bandejas de comunicados y notificaciones. */
export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  overlayScrollContent: { padding: 16, paddingBottom: 40 },

  /* ---------- Comunicados ---------- */
  comCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    marginBottom: 11,
    ...shadowSoft,
  },
  comHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  comAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comAvatarText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  comAuthorBox: { flex: 1 },
  comAuthor: { fontSize: 12.5, fontWeight: '800', color: colors.text },
  comDate: { fontSize: 10.5, color: colors.faint, marginTop: 2, fontWeight: '600' },
  comChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comChipText: { fontSize: 9.5, fontWeight: '700', color: colors.muted },
  comBody: { fontSize: 13, color: colors.textSoft, lineHeight: 20, marginTop: 11 },
  comScopeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },

  /* ---------- Notificaciones ---------- */
  notifCard: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    marginBottom: 9,
  },
  notifCardUnread: { borderColor: '#DDD0F5', backgroundColor: '#FCFAFF' },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 12.5, fontWeight: '800', color: colors.text, flex: 1 },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  notifText: { fontSize: 12, color: colors.textSoft, lineHeight: 18, marginTop: 3 },
  notifDate: { fontSize: 10, color: colors.faint, marginTop: 6, fontWeight: '600' },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: 11,
    marginBottom: 12,
  },
  markAllRowText: { color: colors.primary, fontSize: 12, fontWeight: '800' },

  footNote: {
    textAlign: 'center',
    color: colors.faint,
    fontSize: 10.5,
    marginTop: 26,
    fontWeight: '600',
  },
});
