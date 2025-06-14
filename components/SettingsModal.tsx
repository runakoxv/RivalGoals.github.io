
import React, { useState, useContext, FormEvent } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppActionType } from '../types';
import { UserSettings } from '../types';
import { XIcon, SaveIcon } from './icons';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { state, dispatch } = useContext(AppContext);
  const [settings, setSettings] = useState<UserSettings>(state.userSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: AppActionType.UPDATE_SETTINGS, payload: settings });
    onClose();
  };

  const inputClass = "w-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark p-2.5 rounded-lg border border-border-light dark:border-border-dark focus:ring-2 focus:ring-accent-purple focus:border-transparent focus:outline-none text-sm";
  const labelClass = "block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1.5";

  return (
    <div className="fixed inset-0 bg-primary-dark/50 dark:bg-primary-dark/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glassmorphic p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-border-light dark:border-border-dark">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">Settings</h2>
          <button onClick={onClose} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark p-1.5 rounded-full hover:bg-surface-light/50 dark:hover:bg-surface-dark/50">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="userName" className={labelClass}>
              Your Name
            </label>
            <input
              type="text"
              name="userName"
              id="userName"
              value={settings.userName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="pomodoroWorkDuration" className={labelClass}>
              Pomodoro Work Duration (minutes)
            </label>
            <input
              type="number"
              name="pomodoroWorkDuration"
              id="pomodoroWorkDuration"
              value={settings.pomodoroWorkDuration}
              onChange={handleChange}
              className={inputClass}
              min="1"
            />
          </div>
          <div>
            <label htmlFor="pomodoroBreakDuration" className={labelClass}>
              Pomodoro Break Duration (minutes)
            </label>
            <input
              type="number"
              name="pomodoroBreakDuration"
              id="pomodoroBreakDuration"
              value={settings.pomodoroBreakDuration}
              onChange={handleChange}
              className={inputClass}
              min="1"
            />
          </div>
          <div className="flex justify-end pt-5 border-t border-border-light dark:border-border-dark">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 text-white rounded-lg font-medium flex items-center space-x-2 transition-opacity"
              aria-label="Save settings"
            >
              <SaveIcon className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
