
import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; 
import { AppContext } from '../contexts/AppContext';
import ProgressBar from './ProgressBar'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task, KanbanStatus, DailyStat } from '../types';
import { FolderIcon, CheckCircleIcon, ClockIcon, SparklesIcon, ChevronRightIcon, IconProps, RivalGoalsLogoIcon } from './icons'; 

const DashboardView: React.FC = () => {
  const { state } = useContext(AppContext);
  const { userName } = state.userSettings;
  const { currentUserXP, currentRivaXP, rivaTargetToday, currentStreak, tasks, dailyHistory, lastRivaActivityMessage, theme } = state;

  const activeTasksCount = tasks.filter(t => t.status === KanbanStatus.ToDo || t.status === KanbanStatus.InProgress).length;
  const completedTodayCount = tasks.filter(t => t.status === KanbanStatus.Done && new Date(t.createdAt).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length;

  const userProgressPercent = rivaTargetToday > 0 ? (currentUserXP / rivaTargetToday) * 100 : (currentUserXP > 0 ? 100 : 0);
  const rivaProgressPercent = rivaTargetToday > 0 ? (currentRivaXP / rivaTargetToday) * 100 : 0;

  const todoTasks = tasks.filter(task => task.status === KanbanStatus.ToDo).slice(0, 5); 

  const chartData: DailyStat[] = [...dailyHistory].slice(-5); 
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInHistory = chartData.find(d => d.date === todayStr);

  if (!todayInHistory) {
    chartData.push({
      date: todayStr, 
      userXP: currentUserXP,
      rivaXP: currentRivaXP, 
      tasksCompleted: completedTodayCount, 
      focusBlocksCompleted: 0, 
    });
    if (chartData.length > 5) chartData.shift(); 
  } else {
    const todayIndex = chartData.findIndex(d => d.date === todayStr);
    if (todayIndex !== -1) {
        chartData[todayIndex] = {
            ...chartData[todayIndex],
            userXP: currentUserXP,
            rivaXP: currentRivaXP, 
            tasksCompleted: completedTodayCount
        };
    }
  }
  
  const formattedChartData = chartData.map(day => ({
    ...day,
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }), 
  }));

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    subValue?: string; 
    icon: React.ReactElement<IconProps>; 
    iconColorClass?: string;
    valueColorClass?: string;
    comparisonText?: string; 
    showProgressBar?: boolean; 
    progress?: number; 
    progressGradient?: string; // e.g. "from-accent-purple to-accent-pink"
    activityMessage?: string | null;
  }> = 
    ({ title, value, subValue, icon, iconColorClass = "text-accent-purple", valueColorClass, comparisonText, showProgressBar, progress, progressGradient, activityMessage }) => (
    <div className="glassmorphic p-5 rounded-xl shadow-glass flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{title}</h3>
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-surface-light/50 dark:bg-surface-dark/50 ${iconColorClass}`}>
            {React.cloneElement(icon, { className: "w-4 h-4"})}
          </div>
        </div>
        <p className={`text-3xl font-semibold ${valueColorClass || 'text-text-primary-light dark:text-text-primary-dark'}`}>{value}
          {subValue && <span className="text-xl text-text-secondary-light dark:text-text-secondary-dark ml-1.5">{subValue}</span>}
        </p>
        {comparisonText && <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mt-0.5">{comparisonText}</p>}
      </div>
      {showProgressBar && progress !== undefined && (
        <ProgressBar progress={progress} gradient={progressGradient} height="h-2" />
      )}
      {activityMessage && (
        <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mt-2 italic h-6 overflow-hidden text-ellipsis whitespace-nowrap" title={activityMessage}>
          {activityMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="pb-2">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink dark:from-accent-purple dark:to-accent-blue">Welcome Back, {userName}! 👋</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">You have {activeTasksCount} active tasks. {completedTodayCount > 0 ? `${completedTodayCount} completed today!` : "Let's make today productive!"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard 
          title="Your Daily Goal" 
          value={currentUserXP} 
          subValue={`/ ${rivaTargetToday} XP`}
          icon={<SparklesIcon />} 
          iconColorClass="text-accent-blue"
          valueColorClass="text-accent-blue"
          comparisonText={`${Math.round(userProgressPercent)}% of Riva's Target`}
          showProgressBar={true}
          progress={userProgressPercent}
          progressGradient="from-accent-blue to-accent-purple"
        />
        <StatCard 
          title="Rival's Pace" 
          value={currentRivaXP} 
          subValue={`/ ${rivaTargetToday} XP`}
          icon={<RivalGoalsLogoIcon />}
          iconColorClass="text-accent-pink"
          valueColorClass="text-accent-pink"
          comparisonText={`${Math.round(rivaProgressPercent)}% of her daily target`}
          showProgressBar={true}
          progress={rivaProgressPercent}
          progressGradient="from-accent-pink to-accent-purple"
          activityMessage={lastRivaActivityMessage}
        />
        <StatCard 
          title="Active Tasks" 
          value={activeTasksCount} 
          icon={<ClockIcon />} 
          iconColorClass="text-yellow-500 dark:text-yellow-400"
          valueColorClass="text-yellow-500 dark:text-yellow-400"
          comparisonText="Tasks in 'To Do' or 'In Progress'"
        />
        <StatCard 
          title="Daily Streak" 
          value={currentStreak} 
          subValue="days"
          icon={<CheckCircleIcon />} 
          iconColorClass="text-green-500 dark:text-green-400"
          valueColorClass="text-green-500 dark:text-green-400"
          comparisonText="Consecutive days with activity"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Today's Tasks</h3>
            <Link to="/tasks" className="text-sm text-accent-blue hover:underline flex items-center">
              View All <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {todoTasks.length > 0 ? (
            <ul className="space-y-3">
              {todoTasks.map(task => (
                <li key={task.id} className="p-3 bg-primary-light dark:bg-primary-dark rounded-lg border border-border-light dark:border-border-dark hover:border-accent-blue transition-colors group">
                  <p className="text-sm text-text-primary-light dark:text-text-primary-dark font-medium group-hover:text-accent-blue">{task.title}</p>
                  <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">XP: {task.xp}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No tasks in 'To Do'. Add some from the Task Board!</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">Performance Overview</h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">Your XP vs Riva's XP (Last 5 Days + Today)</p>
          {formattedChartData.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}> 
              <ResponsiveContainer>
                <BarChart data={formattedChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "var(--border-color)" : "var(--border-color)"} opacity={0.5}/> 
                  <XAxis dataKey="name" stroke={theme === 'dark' ? "var(--text-tertiary)" : "var(--text-tertiary)"} fontSize={12} />
                  <YAxis stroke={theme === 'dark' ? "var(--text-tertiary)" : "var(--text-tertiary)"} fontSize={12} />
                  <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? 'var(--bg-surface)' : 'var(--bg-surface)', 
                        border: `1px solid ${theme === 'dark' ? 'var(--border-color)' : 'var(--border-color)'}`, 
                        borderRadius: '0.5rem', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        padding: '8px 12px',
                      }} 
                      itemStyle={{ color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-primary)' }}
                      labelStyle={{ color: theme === 'dark' ? 'var(--text-secondary)' : 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}
                      cursor={{fill: theme === 'dark' ? 'rgba(127, 0, 255, 0.1)' : 'rgba(127, 0, 255, 0.05)'}}
                  />
                  <Legend wrapperStyle={{ color: theme === 'dark' ? 'var(--text-secondary)' : 'var(--text-secondary)', fontSize: '12px', paddingTop: '10px' }} />
                  <defs>
                    <linearGradient id="userXpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={'var(--accent-blue)'} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={'var(--accent-purple)'} stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="rivaXpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={'var(--accent-pink)'} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={'var(--accent-purple)'} stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <Bar dataKey="userXP" name="Your XP" fill="url(#userXpGradient)" radius={[4, 4, 0, 0]} barSize={18} /> 
                  <Bar dataKey="rivaXP" name="Riva's XP" fill="url(#rivaXpGradient)" radius={[4, 4, 0, 0]} barSize={18} /> 
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-10">Not enough data for performance chart yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
