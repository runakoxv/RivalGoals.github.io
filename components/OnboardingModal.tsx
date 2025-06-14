
import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppActionType } from '../types';
import { RivalGoalsLogoIcon } from './icons';

interface OnboardingModalProps {
  onComplete: () => void; 
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { dispatch, state } = useContext(AppContext);
  const [userName, setUserName] = useState(state.userSettings.userName === "Rival" ? "" : state.userSettings.userName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      dispatch({ type: AppActionType.SET_USERNAME, payload: userName.trim() });
      dispatch({ type: AppActionType.COMPLETE_ONBOARDING });
      onComplete(); 
    }
  };

  const inputClass = "w-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark p-3 rounded-lg border border-border-light dark:border-border-dark focus:ring-2 focus:ring-accent-purple focus:border-transparent focus:outline-none text-base";

  return (
    <div className="fixed inset-0 bg-primary-dark/50 dark:bg-primary-dark/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="glassmorphic p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border-border-light dark:border-border-dark text-center">
        <div className="flex justify-center mb-5">
            <RivalGoalsLogoIcon className="w-16 h-16 text-accent-purple" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3">Welcome to RivalGoals!</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Ready to boost your productivity and conquer your goals? Let's start by setting up your profile.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="onboardingUserName" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1.5 text-left">
              What should we call you?
            </label>
            <input
              type="text"
              name="userName"
              id="onboardingUserName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={inputClass}
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!userName.trim()}
            className="w-full px-5 py-3 text-base bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 text-white rounded-lg font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Let's Get Started!
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
