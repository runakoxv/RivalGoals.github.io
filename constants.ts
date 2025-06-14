
import { AppState, KanbanStatus, Title, UserSettings, Theme } from './types';

export const XP_PER_TASK_COMPLETION = 150;
export const XP_PER_POMODORO_MINUTE = 5;

export const RIVA_BASELINE_XP_PER_DAY = 1200;
export const RIVA_PERFORMANCE_MODIFIER_MIN = 0.75;
export const RIVA_PERFORMANCE_MODIFIER_MAX = 1.5;
export const RIVA_UPDATE_INTERVAL = 1000 * 20; 

export const RIVA_XP_GAIN_CHANCE = 0.3; 
export const RIVA_POSSIBLE_XP_GAINS = [25, 50, 75, 100, 125, 150]; 

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userName: "Rival", 
  pomodoroWorkDuration: 25, 
  pomodoroBreakDuration: 5,  
};

export const INITIAL_APP_STATE: AppState = {
  initialized: false,
  onboardingCompleted: false, 
  theme: 'dark', // Default theme, can be 'light' or based on system preference
  tasks: [],
  userSettings: DEFAULT_USER_SETTINGS,
  dailyHistory: [],
  currentUserXP: 0,
  currentRivaXP: 0,
  rivaTargetToday: RIVA_BASELINE_XP_PER_DAY * RIVA_PERFORMANCE_MODIFIER_MIN, 
  currentStreak: 0,
  totalFocusBlocksCompleted: 0,
  currentTitle: Title.Novice,
  lastLoginDate: new Date().toISOString().split('T')[0],
  savedNotes: [], 
  lastRivaActivityMessage: null,
  focusAddTaskTrigger: 0, 
};

export const LOCAL_STORAGE_KEY = "rivalgoals_data";

export const KANBAN_COLUMNS: KanbanStatus[] = [
  KanbanStatus.ToDo,
  KanbanStatus.InProgress,
  KanbanStatus.Done,
];

export const TITLES_CONFIG: Record<Title, { requirement: (state: AppState) => boolean; rank: number }> = {
  [Title.Novice]: { requirement: () => true, rank: 0 },
  [Title.StreakStarter]: { requirement: (state) => state.currentStreak >= 3, rank: 1 },
  [Title.ConsistentCompetitor]: { requirement: (state) => state.currentStreak >= 7, rank: 2 },
  [Title.RivalsBane]: { 
    requirement: (state) => state.dailyHistory.some(day => day.userXP > day.rivaXP + 500) || (state.currentUserXP > state.rivaTargetToday + 500), 
    rank: 3 
  },
  [Title.DeepWorker]: { requirement: (state) => state.totalFocusBlocksCompleted >= 20, rank: 4 },
  [Title.UnstoppableForce]: { requirement: (state) => state.currentStreak >= 30, rank: 5 },
  [Title.FocusGrandmaster]: { requirement: (state) => state.totalFocusBlocksCompleted >= 100, rank: 6 },
};

export const ORDERED_TITLES = Object.entries(TITLES_CONFIG)
    .sort(([, a], [, b]) => b.rank - a.rank)
    .map(([title]) => title as Title);

export const RIVA_ACTIVITY_MESSAGES: Array<(xpGained: number) => string> = [
  (xp) => `Riva just finished reading a chapter (+${xp} XP).`,
  (xp) => `Riva completed a coding exercise (+${xp} XP).`,
  (xp) => `Riva outlined a new project strategy (+${xp} XP).`,
  (xp) => `Riva debugged a tricky piece of code (+${xp} XP).`,
  (xp) => `Riva reviewed and refactored some legacy systems (+${xp} XP).`,
  (xp) => `Riva helped a colleague with a complex problem (+${xp} XP).`,
  (xp) => `Riva learned a new productivity hack (+${xp} XP).`,
  (xp) => `Riva crushed a challenging task (+${xp} XP).`,
  (xp) => `Riva automated a repetitive process (+${xp} XP).`,
  (xp) => `Riva shipped a small update (+${xp} XP).`,
  (xp) => `Riva finalized a design mockup (+${xp} XP).`,
  (xp) => `Riva conducted user research (+${xp} XP).`,
  (xp) => `Riva is on a roll, gaining ${xp} XP!`,
];
