
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TaskBoardView from './components/TaskBoardView';
import InsightsView from './components/InsightsView';
import NotesLibraryView from './components/NotesLibraryView';
import NoteEditorModal from './components/NoteEditorModal';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import { AppContext } from './contexts/AppContext';
import { AppActionType, ScrapNote } from './types';
import { RIVA_UPDATE_INTERVAL } from './constants';
import { MenuIcon, ArrowDownOnSquareIcon, PencilAltIcon, SunIcon, MoonIcon } from './components/icons'; // Added Sun/Moon
import useGlobalHotkeys from './hooks/useGlobalHotkeys';


const MainContentHeader: React.FC = () => {
  const location = useLocation();
  let title = "Dashboard";
  if (location.pathname.includes("/tasks")) title = "Task Board";
  if (location.pathname.includes("/insights")) title = "Insights";
  if (location.pathname.includes("/notes")) title = "Notes Library";

  const lastUpdated = "12 May 2025"; 
  const userAvatars = [ 
    "https://via.placeholder.com/32/7F00FF/E5E5E5?text=U1", 
    "https://via.placeholder.com/32/6E6E6E/E5E5E5?text=U2",
    "https://via.placeholder.com/32/3D3D3D/E5E5E5?text=U3",
  ];

  return (
    <div className="glassmorphic px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b dark:border-border-dark border-border-light">
      <div className="flex items-center">
        <button 
            onClick={() => (window as any).toggleSidebar()} 
            className="text-text-secondary-light dark:text-text-secondary-dark p-2 rounded-md hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 md:hidden mr-3"
        >
            <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark hidden sm:block">Last Updated {lastUpdated}</span>
        <div className="flex -space-x-2 hidden sm:flex">
          {userAvatars.map((avatar, index) => (
            <img key={index} src={avatar} alt={`User ${index + 1}`} className="w-8 h-8 rounded-full border-2 border-surface-light dark:border-surface-dark" />
          ))}
        </div>
        <button className="hidden sm:flex items-center space-x-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark bg-surface-light dark:bg-surface-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 px-3 py-1.5 rounded-md text-sm border border-border-light dark:border-border-dark">
          <ArrowDownOnSquareIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<ScrapNote | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  useEffect(() => {
    if (state.initialized && !state.onboardingCompleted) {
      setIsOnboardingModalOpen(true);
    }
  }, [state.initialized, state.onboardingCompleted]);

  useEffect(() => {
    if (!state.initialized || !state.onboardingCompleted) return;

    const rivaInterval = setInterval(() => {
      dispatch({ type: AppActionType.ATTEMPT_RIVA_XP_GAIN });
    }, RIVA_UPDATE_INTERVAL);

    return () => clearInterval(rivaInterval);
  }, [state.initialized, state.onboardingCompleted, dispatch]);
  
  useEffect(() => {
    (window as any).toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    return () => { delete (window as any).toggleSidebar; };
  }, []);

  const handleOpenNewNoteModal = useCallback(() => {
    setNoteToEdit(null);
    setIsNoteEditorOpen(true);
  }, []);

  useGlobalHotkeys([
    { keys: ['Alt', 's'], callback: handleOpenNewNoteModal },
    { 
      keys: ['Shift', 'N'], 
      callback: () => {
        navigate('/tasks');
        dispatch({ type: AppActionType.REQUEST_FOCUS_ADD_TASK });
      }
    },
  ]);


  if (!state.initialized) {
    return <div className="flex items-center justify-center h-screen bg-primary-light dark:bg-primary-dark text-text-primary-light dark:text-text-primary-dark text-xl">Loading RivalGoals...</div>;
  }
  
  const toggleSettingsModal = () => setIsSettingsModalOpen(!isSettingsModalOpen);
  const handleOnboardingComplete = () => setIsOnboardingModalOpen(false);


  return (
    <div className="flex h-screen bg-primary-light dark:bg-primary-dark text-text-primary-light dark:text-text-primary-dark overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onSettingsToggle={toggleSettingsModal} 
      />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <MainContentHeader />
        
        <div className="p-4 sm:p-6 lg:p-8 flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/tasks" element={<TaskBoardView />} />
            <Route path="/insights" element={<InsightsView />} />
            <Route path="/notes" element={<NotesLibraryView />} />
          </Routes>
        </div>
      </main>

      {isOnboardingModalOpen && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {!isOnboardingModalOpen && (
        <button
            onClick={handleOpenNewNoteModal}
            className="fixed bottom-6 right-6 bg-gradient-to-br from-accent-purple to-accent-pink hover:from-accent-purple-hover hover:to-accent-pink-hover text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-40 transform hover:scale-105"
            aria-label="Create New Note (⌥S)"
        >
            <PencilAltIcon className="w-6 h-6" />
        </button>
      )}

      <NoteEditorModal 
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        noteToEdit={noteToEdit}
      />
      {isSettingsModalOpen && <SettingsModal onClose={toggleSettingsModal} />}
    </div>
  );
};

export default App;
