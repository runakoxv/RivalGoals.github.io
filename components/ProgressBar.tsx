
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string; // Tailwind background color class, e.g., 'bg-accent-blue'
  gradient?: string; // Tailwind gradient classes, e.g., 'from-accent-purple to-accent-pink'
  height?: string; // Tailwind height class, e.g., 'h-2'
  backgroundColor?: string; // Tailwind background color for the track, defaults to theme aware
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'bg-accent-blue dark:bg-accent-blue', 
  gradient,
  height = 'h-2',
  backgroundColor = 'bg-surface-light dark:bg-surface-dark' 
}) => {
  const safeProgress = Math.max(0, Math.min(100, progress));

  const barColorClass = gradient ? `bg-gradient-to-r ${gradient}` : color;

  return (
    <div className={`w-full ${backgroundColor} rounded-full ${height} mt-1.5 overflow-hidden border border-border-light/30 dark:border-border-dark/30`}>
      <div
        className={`${barColorClass} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${safeProgress}%` }}
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  );
};

export default ProgressBar;
