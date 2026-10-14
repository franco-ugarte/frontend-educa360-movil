import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topBanner: {
    backgroundColor: '#5F348F',
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 24,

  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 2,
  },
  bellIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -15, // Solapa sutilmente el banner como en tu ejemplo
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#5F348F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  studentGrade: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Estadísticas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  statLabel: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },

  // Módulos
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  moduleCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 110,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  moduleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E1B4B',
    lineHeight: 17,
  },

  // Cursos Pro
  courseCardPro: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  courseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseMainInfo: {
    flex: 1,
    marginLeft: 10,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  courseTeacherName: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  courseTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  courseTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  courseMetaText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  progressPercent: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#5F348F',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#EDE9FE',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5F348F',
    borderRadius: 2.5,
  },

  // Notas
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeCourseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  gradePeriod: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  gradeScoreBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  gradeScoreValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },

  // Perfil
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarLargeWrap: {
    padding: 3,
    borderRadius: 40,
    marginBottom: 10,
  },
  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#5F348F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  profileFullName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  profileRoleTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 10,
    marginTop: 5,
  },
  profileRoleText: {
    color: '#5F348F',
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValueText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'right',
    flex: 1,
  },
  logoutProButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
  },
  logoutProText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
  },
});