
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, AppActionType, Task, KanbanStatus, Title, DailyStat, UserSettings, ScrapNote, Theme } from '../types';
import { 
  INITIAL_APP_STATE, 
  LOCAL_STORAGE_KEY, 
  RIVA_BASELINE_XP_PER_DAY,
  RIVA_PERFORMANCE_MODIFIER_MAX,
  RIVA_PERFORMANCE_MODIFIER_MIN,
  XP_PER_POMODORO_MINUTE,
  XP_PER_TASK_COMPLETION,
  TITLES_CONFIG,
  ORDERED_TITLES,
  DEFAULT_USER_SETTINGS,
  RIVA_ACTIVITY_MESSAGES,
  RIVA_XP_GAIN_CHANCE, 
  RIVA_POSSIBLE_XP_GAINS 
} from '../constants';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: INITIAL_APP_STATE,
  dispatch: () => null,
});

const calculateUser3DayAverageXP = (dailyHistory: DailyStat[]): number => {
  const last3Days = dailyHistory.slice(-3);
  if (last3Days.length === 0) return 0;
  const sum = last3Days.reduce((acc, day) => acc + day.userXP, 0);
  return sum / last3Days.length;
};

const calculateRiva3DayAverageXP = (dailyHistory: DailyStat[]): number => {
  const last3Days = dailyHistory.slice(-3);
   if (last3Days.length < 3) { 
    const sum = last3Days.reduce((acc, day) => acc + day.rivaXP, 0);
    const missingDays = 3 - last3Days.length;
    return (sum + (missingDays * RIVA_BASELINE_XP_PER_DAY)) / 3;
  }
  const sum = last3Days.reduce((acc, day) => acc + day.rivaXP, 0);
  return sum / last3Days.length;
};

const determineHighestTitle = (state: AppState): Title => {
  for (const title of ORDERED_TITLES) {
    if (TITLES_CONFIG[title].requirement(state)) {
      return title;
    }
  }
  return Title.Novice;
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  let newState: AppState;
  switch (action.type) {
    case AppActionType.INITIALIZE_STATE: {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      let parsedInitialState: AppState;
      if (storedState) {
        let parsed = JSON.parse(storedState) as any; 

        if (parsed.scrapPaperContent && (!parsed.savedNotes || parsed.savedNotes.length === 0)) {
          const now = new Date().toISOString();
          const migratedNote: ScrapNote = {
            id: uuidv4(),
            title: "My First Note (Migrated)",
            content: parsed.scrapPaperContent,
            createdAt: now,
            updatedAt: now,
          };
          parsed.savedNotes = [migratedNote];
        }
        delete parsed.scrapPaperContent; 

        parsed.userSettings = { ...DEFAULT_USER_SETTINGS, ...parsed.userSettings };
        parsed.lastRivaActivityMessage = parsed.lastRivaActivityMessage || null;
        parsed.savedNotes = Array.isArray(parsed.savedNotes) ? parsed.savedNotes : [];
        parsed.onboardingCompleted = typeof parsed.onboardingCompleted === 'boolean' ? parsed.onboardingCompleted : false;
        parsed.focusAddTaskTrigger = typeof parsed.focusAddTaskTrigger === 'number' ? parsed.focusAddTaskTrigger : 0;
        parsed.theme = parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : INITIAL_APP_STATE.theme; // Load theme
        
        parsedInitialState = { ...INITIAL_APP_STATE, ...parsed, initialized: true };

      } else {
        // Attempt to get system preference for theme on first load
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        parsedInitialState = { ...INITIAL_APP_STATE, theme: systemPrefersDark ? 'dark' : 'light', initialized: true };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedInitialState));
      }
      
      const today = new Date().toISOString().split('T')[0];
      if (parsedInitialState.lastLoginDate !== today && parsedInitialState.onboardingCompleted) { 
        return appReducer(parsedInitialState, { type: AppActionType.HANDLE_NEW_DAY });
      }
      return parsedInitialState; 
    }
    case AppActionType.HANDLE_NEW_DAY: {
      const yesterday = state.lastLoginDate;
      const currentHistory = Array.isArray(state.dailyHistory) ? state.dailyHistory : [];

      const yesterdayStat: DailyStat = {
        date: yesterday,
        userXP: state.currentUserXP,
        rivaXP: state.rivaTargetToday, 
        tasksCompleted: state.tasks.filter(t => t.status === KanbanStatus.Done && new Date(t.createdAt).toISOString().split('T')[0] === yesterday).length,
        focusBlocksCompleted: 0, 
      };
      
      const newDailyHistory = [...currentHistory, yesterdayStat].slice(-30);

      const user3DayAvg = calculateUser3DayAverageXP(newDailyHistory);
      const riva3DayAvg = calculateRiva3DayAverageXP(newDailyHistory);
      
      let performanceModifier = riva3DayAvg > 0 ? user3DayAvg / riva3DayAvg : 1;
      performanceModifier = Math.max(RIVA_PERFORMANCE_MODIFIER_MIN, Math.min(RIVA_PERFORMANCE_MODIFIER_MAX, performanceModifier));
      
      const newRivaTargetToday = Math.round(RIVA_BASELINE_XP_PER_DAY * performanceModifier);
      
      const newStreak = (state.currentUserXP > 0 || yesterdayStat.tasksCompleted > 0) ? state.currentStreak + 1 : 0;

      newState = {
        ...state,
        dailyHistory: newDailyHistory,
        currentUserXP: 0,
        currentRivaXP: 0, 
        rivaTargetToday: newRivaTargetToday,
        currentStreak: newStreak,
        lastLoginDate: new Date().toISOString().split('T')[0],
        lastRivaActivityMessage: "Riva is strategizing for the day ahead...", 
      };
      newState.currentTitle = determineHighestTitle(newState);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState)); 
      return newState;
    }
    case AppActionType.TOGGLE_THEME:
      newState = { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
      break;
    case AppActionType.COMPLETE_ONBOARDING:
      newState = { ...state, onboardingCompleted: true };
      break;
    case AppActionType.SET_USERNAME:
      newState = { ...state, userSettings: { ...state.userSettings, userName: action.payload } };
      break;
    case AppActionType.ADD_TASK:
      const newTask: Task = {
        id: uuidv4(),
        title: action.payload.title,
        status: KanbanStatus.ToDo,
        createdAt: new Date().toISOString(),
        xp: XP_PER_TASK_COMPLETION,
      };
      newState = { ...state, tasks: [...state.tasks, newTask] };
      break;
    case AppActionType.UPDATE_TASK_STATUS:
      let taskXPGain = 0;
      const updatedTasks = state.tasks.map(task => {
        if (task.id === action.payload.taskId) {
          if (task.status !== KanbanStatus.Done && action.payload.newStatus === KanbanStatus.Done) {
            taskXPGain = task.xp;
          }
          return { ...task, status: action.payload.newStatus };
        }
        return task;
      });
      newState = { 
        ...state, 
        tasks: updatedTasks,
        currentUserXP: state.currentUserXP + taskXPGain,
      };
      newState.currentTitle = determineHighestTitle(newState);
      break;
    case AppActionType.DELETE_TASK:
      newState = { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
      break;
    case AppActionType.COMPLETE_POMODORO_SESSION:
      const pomodoroXPGain = action.payload.minutes * XP_PER_POMODORO_MINUTE;
      newState = {
        ...state,
        currentUserXP: state.currentUserXP + pomodoroXPGain,
        totalFocusBlocksCompleted: state.totalFocusBlocksCompleted + 1,
      };
      newState.currentTitle = determineHighestTitle(newState);
      break;
    case AppActionType.UPDATE_SETTINGS:
      newState = { ...state, userSettings: { ...state.userSettings, ...action.payload } };
      break;
    case AppActionType.ADD_NOTE: {
      const now = new Date().toISOString();
      const newNote: ScrapNote = {
        id: uuidv4(),
        title: action.payload.title,
        content: action.payload.content,
        createdAt: now,
        updatedAt: now,
      };
      newState = { ...state, savedNotes: [newNote, ...state.savedNotes] };
      break;
    }
    case AppActionType.UPDATE_NOTE: {
      const noteToUpdate = action.payload;
      newState = {
        ...state,
        savedNotes: state.savedNotes.map(note =>
          note.id === noteToUpdate.id ? { ...noteToUpdate, updatedAt: new Date().toISOString() } : note
        ),
      };
      break;
    }
    case AppActionType.DELETE_NOTE:
      newState = { ...state, savedNotes: state.savedNotes.filter(note => note.id !== action.payload) };
      break;
    case AppActionType.UPDATE_RIVA_XP: 
        newState = {
            ...state, 
            currentRivaXP: Math.min(action.payload, state.rivaTargetToday), 
        };
        break;
    case AppActionType.ATTEMPT_RIVA_XP_GAIN: {
      if (state.currentRivaXP >= state.rivaTargetToday) {
        return state; 
      }
      let newRivaXP = state.currentRivaXP;
      let activityMessage = state.lastRivaActivityMessage;
      if (Math.random() < RIVA_XP_GAIN_CHANCE) {
        const xpIndex = Math.floor(Math.random() * RIVA_POSSIBLE_XP_GAINS.length);
        const gainedXpAmount = RIVA_POSSIBLE_XP_GAINS[xpIndex];
        newRivaXP = Math.min(state.currentRivaXP + gainedXpAmount, state.rivaTargetToday);
        if (newRivaXP > state.currentRivaXP && RIVA_ACTIVITY_MESSAGES.length > 0) {
            const actualXPGained = newRivaXP - state.currentRivaXP;
            const msgIndex = Math.floor(Math.random() * RIVA_ACTIVITY_MESSAGES.length);
            activityMessage = RIVA_ACTIVITY_MESSAGES[msgIndex](actualXPGained);
        }
      } 
      newState = { 
          ...state, 
          currentRivaXP: newRivaXP,
          lastRivaActivityMessage: newRivaXP > state.currentRivaXP ? activityMessage : state.lastRivaActivityMessage 
        };
      break;
    }
    case AppActionType.REQUEST_FOCUS_ADD_TASK:
      newState = { ...state, focusAddTaskTrigger: state.focusAddTaskTrigger + 1 };
      break;
    default:
      newState = state; 
  }
  
  // Save all relevant state, including theme
  const stateToSave = { ...newState };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  return newState;
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_APP_STATE);

  useEffect(() => {
    dispatch({ type: AppActionType.INITIALIZE_STATE });
  }, []); 

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
