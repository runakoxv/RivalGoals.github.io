
export enum KanbanStatus {
  ToDo = "To Do",
  InProgress = "In Progress",
  Done = "Done",
}

export interface Task {
  id: string;
  title: string;
  status: KanbanStatus;
  createdAt: string; 
  xp: number;
  // Future enhancements:
  // description?: string;
  // dueDate?: string; 
  // isTimeSensitive?: boolean;
}

export interface UserSettings {
  userName: string;
  pomodoroWorkDuration: number; // in minutes
  pomodoroBreakDuration: number; // in minutes
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  userXP: number;
  rivaXP: number; 
  tasksCompleted: number;
  focusBlocksCompleted: number;
}

export enum Title {
  Novice = "Novice", 
  StreakStarter = "StreakStarter", 
  ConsistentCompetitor = "Consistent Competitor",
  UnstoppableForce = "Unstoppable Force", 
  DeepWorker = "Deep Worker", 
  FocusGrandmaster = "Focus Grandmaster", 
  RivalsBane = "Rival's Bane", 
}

export interface ScrapNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  initialized: boolean;
  onboardingCompleted: boolean; 
  theme: Theme; // New for theme switching
  tasks: Task[];
  userSettings: UserSettings;
  dailyHistory: DailyStat[]; 
  
  currentUserXP: number;
  currentRivaXP: number;
  rivaTargetToday: number;

  currentStreak: number;
  totalFocusBlocksCompleted: number;
  currentTitle: Title;
  
  lastLoginDate: string; // YYYY-MM-DD
  savedNotes: ScrapNote[]; 
  lastRivaActivityMessage: string | null; 
  focusAddTaskTrigger: number;
}

export enum AppActionType {
  INITIALIZE_STATE = "INITIALIZE_STATE",
  HANDLE_NEW_DAY = "HANDLE_NEW_DAY",
  
  TOGGLE_THEME = "TOGGLE_THEME", // New for theme switching

  // Onboarding
  COMPLETE_ONBOARDING = "COMPLETE_ONBOARDING",
  SET_USERNAME = "SET_USERNAME",

  // Tasks
  ADD_TASK = "ADD_TASK",
  UPDATE_TASK_STATUS = "UPDATE_TASK_STATUS",
  DELETE_TASK = "DELETE_TASK", 

  // Pomodoro
  COMPLETE_POMODORO_SESSION = "COMPLETE_POMODORO_SESSION",

  // Settings
  UPDATE_SETTINGS = "UPDATE_SETTINGS",

  // Notes
  ADD_NOTE = "ADD_NOTE",
  UPDATE_NOTE = "UPDATE_NOTE",
  DELETE_NOTE = "DELETE_NOTE",

  // Rival
  UPDATE_RIVA_XP = "UPDATE_RIVA_XP", 
  ATTEMPT_RIVA_XP_GAIN = "ATTEMPT_RIVA_XP_GAIN",

  // UI Triggers
  REQUEST_FOCUS_ADD_TASK = "REQUEST_FOCUS_ADD_TASK",
}

export type AppAction =
  | { type: AppActionType.INITIALIZE_STATE }
  | { type: AppActionType.HANDLE_NEW_DAY }
  | { type: AppActionType.TOGGLE_THEME } // New for theme switching
  | { type: AppActionType.COMPLETE_ONBOARDING }
  | { type: AppActionType.SET_USERNAME; payload: string }
  | { type: AppActionType.ADD_TASK; payload: Pick<Task, 'title'> }
  | { type: AppActionType.UPDATE_TASK_STATUS; payload: { taskId: string; newStatus: KanbanStatus } }
  | { type: AppActionType.DELETE_TASK; payload: string }
  | { type: AppActionType.COMPLETE_POMODORO_SESSION; payload: { minutes: number } }
  | { type: AppActionType.UPDATE_SETTINGS; payload: Partial<UserSettings> }
  | { type: AppActionType.ADD_NOTE; payload: Pick<ScrapNote, 'title' | 'content'> }
  | { type: AppActionType.UPDATE_NOTE; payload: ScrapNote }
  | { type: AppActionType.DELETE_NOTE; payload: string } 
  | { type: AppActionType.UPDATE_RIVA_XP; payload: number }
  | { type: AppActionType.ATTEMPT_RIVA_XP_GAIN }
  | { type: AppActionType.REQUEST_FOCUS_ADD_TASK };
