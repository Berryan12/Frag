import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#08090B',
  card: '#14171B',
  border: '#2B2F35',
  text: '#F4F4F4',
  muted: '#9B9FA6',
  red: '#E53945',
  redDark: '#3A171B',
  win: '#173A2C',
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
  },

  searchSection: {
    marginBottom: 22,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },

  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  playerInfo: {
    marginLeft: 10,
  },

  playerName: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '700',
  },

  mutedText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingVertical: 12,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleText: {
    flex: 1,
    marginLeft: 12,
  },

  roleName: {
    color: COLORS.red,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },

  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  agentName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  matchesRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  matchBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  matchText: {
    color: COLORS.text,
    fontWeight: '800',
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
});


//1. case 1: replace the push navigation in expo router with <link>
//2. case 2: create a new route with containing home profile and setting pages create 2 layout to manage navigation between the pages
//3. Case 3 : refactor 1 of the names of a states variable and make sure the program continous to work like before