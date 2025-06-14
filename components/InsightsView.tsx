
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyStat } from '../types';
import { ChartBarIcon, FireIcon, IconProps } from './icons'; 

const InsightsView: React.FC = () => {
  const { state } = useContext(AppContext);
  const { theme } = state; // Get current theme

  const last7DaysHistory: DailyStat[] = [...state.dailyHistory].slice(-7);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInHistoryIndex = last7DaysHistory.findIndex(d => d.date === todayStr);

  if (todayInHistoryIndex !== -1) {
    last7DaysHistory[todayInHistoryIndex] = {
      ...last7DaysHistory[todayInHistoryIndex],
      userXP: state.currentUserXP,
      rivaXP: state.currentRivaXP,
    };
  } else {
     if (state.currentUserXP > 0 || state.currentRivaXP > 0 || last7DaysHistory.length < 7) { 
        last7DaysHistory.push({
            date: todayStr, 
            userXP: state.currentUserXP,
            rivaXP: state.currentRivaXP, 
            tasksCompleted: state.tasks.filter(t => t.status === 'Done' && new Date(t.createdAt).toISOString().split('T')[0] === todayStr).length,
            focusBlocksCompleted: 0, 
        });
        if(last7DaysHistory.length > 7) last7DaysHistory.shift(); 
     }
  }
  
  const formattedChartData = last7DaysHistory.map(day => ({
    ...day,
    name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));


  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactElement<IconProps>; 
    iconColorClass?: string;
    valueColorClass?: string; 
    unit?: string; 
  }> = 
  ({ title, value, icon, iconColorClass = "text-accent-purple", valueColorClass, unit }) => (
    <div className="glassmorphic p-6 rounded-xl shadow-glass">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{title}</h3>
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-surface-light/50 dark:bg-surface-dark/50 ${iconColorClass}`}>
          {React.cloneElement(icon, { className: "w-4 h-4"})}
        </div>
      </div>
      <p className={`text-3xl font-semibold ${valueColorClass || 'text-text-primary-light dark:text-text-primary-dark'}`}>
        {value} {unit && <span className="text-xl text-text-secondary-light dark:text-text-secondary-dark">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-surface-light dark:bg-surface-dark p-5 sm:p-6 rounded-xl border border-border-light dark:border-border-dark shadow-lg">
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">XP Overview</h2>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">Your XP vs Riva's XP (Last 7 Days)</p>
        {formattedChartData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={formattedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "var(--border-color)" : "var(--border-color)"} opacity={0.5} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? "var(--text-tertiary)" : "var(--text-tertiary)"} fontSize={12} />
                <YAxis stroke={theme === 'dark' ? "var(--text-tertiary)" : "var(--text-tertiary)"} fontSize={12}/>
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
                    <linearGradient id="insightsUserXpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={'var(--accent-blue)'} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={'var(--accent-purple)'} stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="insightsRivaXpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={'var(--accent-pink)'} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={'var(--accent-purple)'} stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                <Bar dataKey="userXP" name="Your XP" fill="url(#insightsUserXpGradient)" radius={[4, 4, 0, 0]} barSize={18}/>
                <Bar dataKey="rivaXP" name="Riva's XP" fill="url(#insightsRivaXpGradient)" radius={[4, 4, 0, 0]} barSize={18}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-10">Not enough data for the chart yet. Keep completing tasks and sessions!</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <StatCard 
          title="Total Focus Blocks" 
          value={state.totalFocusBlocksCompleted} 
          icon={<ChartBarIcon />} 
          iconColorClass="text-accent-blue"
          valueColorClass="text-accent-blue"
          unit="blocks"
        />
        <StatCard 
          title="Current Streak" 
          value={state.currentStreak} 
          icon={<FireIcon />} 
          iconColorClass="text-orange-500 dark:text-orange-400"
          valueColorClass="text-orange-500 dark:text-orange-400"
          unit="days"
        />
      </div>
    </div>
  );
};

export default InsightsView;
