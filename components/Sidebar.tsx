
import React, { useContext, useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { AppActionType, UserSettings } from '../types';
import { 
    DashboardIcon, TaskIcon, InsightsIcon, SettingsIcon, RivalGoalsLogoIcon, XIcon, 
    CogIcon, PlayIcon, PauseIcon, RefreshIcon, KeyboardIcon, 
    DocumentTextIcon, SunIcon, MoonIcon // Added Sun/Moon
} from './icons';
import useGlobalHotkeys from '../hooks/useGlobalHotkeys';


interface SidebarProps {
  onSettingsToggle: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItemBase {
  name: string;
  icon: JSX.Element;
}
interface NavLinkItem extends NavItemBase {
  path: string;
  action?: undefined;
}
interface NavActionItem extends NavItemBase {
  action: () => void;
  path?: undefined;
}
type NavItem = NavLinkItem | NavActionItem;

type TimerMode = 'work' | 'break';

const SidebarPomodoro: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { pomodoroWorkDuration, pomodoroBreakDuration } = state.userSettings;

    const [mode, setMode] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(pomodoroWorkDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [completedMinutesThisSession, setCompletedMinutesThisSession] = useState(0);

    const [localWorkDuration, setLocalWorkDuration] = useState(pomodoroWorkDuration);
    const [localBreakDuration, setLocalBreakDuration] = useState(pomodoroBreakDuration);

    const toggleTimer = useCallback(() => setIsActive(prev => !prev), []);

    const resetTimer = useCallback((newMode?: TimerMode) => {
        setIsActive(false);
        const currentMode = newMode || mode;
        setMode(currentMode);
        setTimeLeft((currentMode === 'work' ? localWorkDuration : localBreakDuration) * 60);
        setCompletedMinutesThisSession(0);
    }, [mode, localWorkDuration, localBreakDuration]);
    
    useGlobalHotkeys([{ keys: ['Alt', 'p'], callback: toggleTimer }]);

    useEffect(() => {
        setLocalWorkDuration(pomodoroWorkDuration);
        setLocalBreakDuration(pomodoroBreakDuration);
        if (!isActive) { 
            setTimeLeft((mode === 'work' ? pomodoroWorkDuration : pomodoroBreakDuration) * 60);
        }
    }, [pomodoroWorkDuration, pomodoroBreakDuration, isActive, mode]);

    useEffect(() => {
        let interval: number | undefined = undefined;

        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
                if (mode === 'work') {
                    const initialDurationSeconds = localWorkDuration * 60;
                    if ((initialDurationSeconds - timeLeft) % 60 === 0 && timeLeft !== initialDurationSeconds && timeLeft !== 0) {
                         setCompletedMinutesThisSession(prev => prev + 1);
                    }
                }
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            if (mode === 'work' && completedMinutesThisSession > 0) {
                let finalMinutes = completedMinutesThisSession;
                if (localWorkDuration > 0 && completedMinutesThisSession < localWorkDuration) {
                    finalMinutes = localWorkDuration; 
                }
                if (finalMinutes > 0) {
                   dispatch({ type: AppActionType.COMPLETE_POMODORO_SESSION, payload: { minutes: finalMinutes } });
                }
            }
            const newMode = mode === 'work' ? 'break' : 'work';
            resetTimer(newMode);
            setIsActive(true); 
        }

        return () => window.clearInterval(interval);
    }, [isActive, timeLeft, mode, dispatch, resetTimer, localWorkDuration, completedMinutesThisSession]);

    const handleDurationChange = (e: ChangeEvent<HTMLInputElement>, type: 'work' | 'break') => {
        const value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) return;

        const newSettings: Partial<UserSettings> = {};
        if (type === 'work') {
            setLocalWorkDuration(value);
            newSettings.pomodoroWorkDuration = value;
        } else {
            setLocalBreakDuration(value);
            newSettings.pomodoroBreakDuration = value;
        }
        dispatch({ type: AppActionType.UPDATE_SETTINGS, payload: newSettings });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const progressPercent = () => {
        const totalDuration = (mode === 'work' ? localWorkDuration : localBreakDuration) * 60;
        if (totalDuration === 0) return 0;
        return ((totalDuration - timeLeft) / totalDuration) * 100;
    };

    const accentClass = mode === 'work' ? 'text-accent-blue dark:text-accent-blue' : 'text-accent-pink dark:text-accent-pink'; // Using pink for break
    const bgAccentClass = mode === 'work' ? 'bg-accent-blue' : 'bg-accent-pink';
    const focusRingClass = mode === 'work' ? 'focus:ring-accent-blue' : 'focus:ring-accent-pink';

    return (
        <div className="px-1 py-4 border-t border-border-light dark:border-border-dark">
            <h3 className="text-xs font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider mb-2.5 px-1">Focus Timer (⌥P)</h3>
            <div className="bg-surface-light/30 dark:bg-surface-dark/30 p-3.5 rounded-lg border border-border-light/50 dark:border-border-dark/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${accentClass}`}>
                        {mode === 'work' ? 'Focus Session' : 'Break Time'}
                    </span>
                    <span className="text-2xl font-mono font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="w-full bg-surface-light dark:bg-surface-dark h-1.5 rounded-full overflow-hidden mb-3 border border-border-light/30 dark:border-border-dark/30">
                    <div 
                        className={`h-full rounded-full ${isActive ? bgAccentClass : 'bg-text-tertiary-light dark:bg-text-tertiary-dark'} transition-all duration-300`} 
                        style={{ width: `${progressPercent()}%`}}
                    ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button 
                        onClick={() => { resetTimer('work'); setIsActive(true); }}
                        className={`py-1.5 px-2 text-xs rounded-md border transition-colors ${mode === 'work' ? 'bg-accent-blue text-white border-accent-blue' : 'bg-transparent text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 hover:border-accent-blue'}`}
                    >
                        Focus
                    </button>
                    <button 
                        onClick={() => { resetTimer('break');  setIsActive(true);}}
                        className={`py-1.5 px-2 text-xs rounded-md border transition-colors ${mode === 'break' ? 'bg-accent-pink text-white border-accent-pink' : 'bg-transparent text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 hover:border-accent-pink'}`}
                    >
                        Break
                    </button>
                </div>
                <div className="flex items-center justify-center space-x-2.5">
                    <button onClick={toggleTimer} className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark rounded-full hover:bg-surface-light/50 dark:hover:bg-surface-dark/50">
                        {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => resetTimer()} className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark rounded-full hover:bg-surface-light/50 dark:hover:bg-surface-dark/50">
                        <RefreshIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="mt-3 pt-3 border-t border-border-light/50 dark:border-border-dark/50 space-y-2">
                    <div>
                        <label htmlFor="workDuration" className="block text-xs text-text-tertiary-light dark:text-text-tertiary-dark mb-0.5">Focus (min):</label>
                        <input type="number" id="workDuration" value={localWorkDuration} onChange={(e) => handleDurationChange(e, 'work')} 
                               className={`w-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark p-1.5 rounded text-xs border border-border-light dark:border-border-dark focus:ring-1 ${focusRingClass} focus:outline-none`}/>
                    </div>
                    <div>
                        <label htmlFor="breakDuration" className="block text-xs text-text-tertiary-light dark:text-text-tertiary-dark mb-0.5">Break (min):</label>
                        <input type="number" id="breakDuration" value={localBreakDuration} onChange={(e) => handleDurationChange(e, 'break')}
                               className={`w-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark p-1.5 rounded text-xs border border-border-light dark:border-border-dark focus:ring-1 ${focusRingClass} focus:outline-none`}/>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ onSettingsToggle, isOpen, setIsOpen }) => {
  const location = useLocation();
  const { state, dispatch } = useContext(AppContext);

  const mainNavItems: NavLinkItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { name: 'Tasks', path: '/tasks', icon: <TaskIcon className="w-5 h-5" /> },
    { name: 'Insights', path: '/insights', icon: <InsightsIcon className="w-5 h-5" /> },
    { name: 'Notes', path: '/notes', icon: <DocumentTextIcon className="w-5 h-5" /> },
  ];

  const bottomNavItems: NavActionItem[] = [
    { name: 'Settings', action: onSettingsToggle, icon: <CogIcon className="w-5 h-5" /> },
  ];
  
  const keyboardShortcuts = [
      { shortcut: "⌥ S", action: "New Note" },
      { shortcut: "⇧ N", action: "Focus Add Task" },
      { shortcut: "⌥ P", action: "Toggle Pomodoro" },
  ];

  const NavItemDisplay: React.FC<{item: NavItem; isActive?: boolean; onClick?: () => void}> = ({ item, isActive, onClick }) => {
    const baseClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium";
    const activeClasses = "bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg";
    const inactiveClasses = "text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 hover:text-text-primary-light dark:hover:text-text-primary-dark";

    const content = (
        <>
            {React.cloneElement(item.icon, { className: `w-5 h-5 ${isActive ? 'text-white' : 'text-text-secondary-light dark:text-text-secondary-dark group-hover:text-text-primary-light dark:group-hover:text-text-primary-dark'}`})}
            <span>{item.name}</span>
        </>
    );
    
    const handleClick = () => {
        if (onClick) onClick(); 
        if (item.action) item.action();
    }

    if (item.path) {
      return (
        <Link to={item.path} className={`${baseClasses} group ${isActive ? activeClasses : inactiveClasses}`} onClick={handleClick}>
          {content}
        </Link>
      );
    }
    return (
      <button onClick={handleClick} className={`${baseClasses} w-full group ${isActive ? activeClasses : inactiveClasses}`}>
        {content}
      </button>
    );
  };
  
  const toggleTheme = () => {
      dispatch({ type: AppActionType.TOGGLE_THEME });
  }


  return (
    <>
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
        ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 glassmorphic w-64 p-4 space-y-4 flex flex-col z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex border-r border-border-light dark:border-border-dark`}>
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2.5 text-text-primary-light dark:text-text-primary-dark" onClick={() => setIsOpen(false)}>
            <RivalGoalsLogoIcon className="w-8 h-8 text-accent-purple" />
            <span className="text-xl font-semibold">RivalGoals</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="text-text-secondary-light dark:text-text-secondary-dark p-2 rounded-md hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 md:hidden">
              <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-grow space-y-1.5 mt-2">
          {mainNavItems.map(item => (
            <NavItemDisplay 
                key={item.name} 
                item={item} 
                isActive={location.pathname.startsWith(item.path)}
                onClick={() => setIsOpen(false)} 
            />
          ))}
        </nav>

        <SidebarPomodoro />

        <div className="pt-3 border-t border-border-light dark:border-border-dark">
          <h3 className="text-xs font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider mb-2 px-1 flex items-center">
            <KeyboardIcon className="w-4 h-4 mr-1.5"/> Shortcuts
          </h3>
          <ul className="space-y-1 text-xs">
            {keyboardShortcuts.map(sc => (
                <li key={sc.action} className="flex justify-between items-center text-text-secondary-light dark:text-text-secondary-dark px-1 py-0.5">
                    <span>{sc.action}</span>
                    <span className="font-mono bg-primary-light dark:bg-primary-dark px-1.5 py-0.5 rounded-sm border border-border-light dark:border-border-dark text-text-tertiary-light dark:text-text-tertiary-dark">{sc.shortcut}</span>
                </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1 mt-auto">
          {bottomNavItems.map(item => (
             <NavItemDisplay 
                key={item.name} 
                item={item} 
                onClick={() => setIsOpen(false)}
            />
          ))}
          <button 
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium w-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 hover:text-text-primary-light dark:hover:text-text-primary-dark group"
            aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {state.theme === 'dark' ? <SunIcon className="w-5 h-5 text-text-secondary-dark group-hover:text-text-primary-dark" /> : <MoonIcon className="w-5 h-5 text-text-secondary-light group-hover:text-text-primary-light" />}
            <span>{state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
