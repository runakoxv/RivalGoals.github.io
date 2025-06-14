
import React, { useState, useContext, FormEvent, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppActionType } from '../types'; 
import { Task, KanbanStatus } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import TaskCard from './TaskCard';
import { PlusIcon } from './icons';

const TaskBoardView: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInputForColumn, setShowInputForColumn] = useState<KanbanStatus | null>(null);
  const addTaskInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.focusAddTaskTrigger > 0 && showInputForColumn === KanbanStatus.ToDo) {
      // Small delay to ensure input is rendered if it wasn't before
      setTimeout(() => addTaskInputRef.current?.focus(), 50);
    }
  }, [state.focusAddTaskTrigger, showInputForColumn]);

  const handleShowInput = (status: KanbanStatus) => {
    setShowInputForColumn(status);
    if (status === KanbanStatus.ToDo) {
        // This will trigger the useEffect above if focusAddTaskTrigger also changed
        // Or focus directly if the trigger isn't the cause.
        setTimeout(() => addTaskInputRef.current?.focus(), 50);
    }
  };


  const handleAddTask = (status: KanbanStatus) => (e: FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      dispatch({ type: AppActionType.ADD_TASK, payload: { title: newTaskTitle } });
      setNewTaskTitle('');
      setShowInputForColumn(null);
    }
  };
  
  const tasksByColumn = (status: KanbanStatus): Task[] => {
    return state.tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {KANBAN_COLUMNS.map(status => (
          <div key={status} className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-lg p-4 flex flex-col">
            <h2 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark px-1 mb-4">{status} ({tasksByColumn(status).length})</h2>
            
            <div className="flex-grow space-y-3.5 overflow-y-auto pr-1.5 -mr-1.5 pb-2 min-h-[200px]">
              {tasksByColumn(status).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
               {tasksByColumn(status).length === 0 && (
                <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark text-center py-4">No tasks here yet.</p>
              )}
            </div>

            {showInputForColumn === status ? (
              <form onSubmit={handleAddTask(status)} className="mt-auto pt-3 border-t border-border-light dark:border-border-dark">
                <input
                  ref={status === KanbanStatus.ToDo ? addTaskInputRef : null}
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full bg-primary-light dark:bg-primary-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark p-2.5 rounded-md border border-border-light dark:border-border-dark focus:ring-1 focus:ring-accent-blue focus:border-accent-blue focus:outline-none text-sm"
                />
                <div className="flex justify-end space-x-2 mt-2.5">
                    <button 
                      type="button" 
                      onClick={() => setShowInputForColumn(null)} 
                      className="px-3 py-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 rounded-md"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 text-white rounded-md font-medium"
                    >
                      Add Task
                    </button>
                </div>
              </form>
            ) : (
              status === KanbanStatus.ToDo && (
                <button
                  onClick={() => handleShowInput(status)}
                  className="mt-auto flex items-center justify-center w-full p-2.5 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 rounded-lg transition-colors border-2 border-dashed border-border-light dark:border-border-dark hover:border-accent-blue"
                  aria-label="Add new task to To Do column"
                >
                  <PlusIcon className="w-4 h-4 mr-1.5" /> Add Task
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoardView;
