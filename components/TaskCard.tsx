
import React, { useContext } from 'react';
import { Task, KanbanStatus } from '../types';
import { AppContext } from '../contexts/AppContext';
import { AppActionType } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from './icons';


interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { dispatch } = useContext(AppContext);

  const currentColumnIndex = KANBAN_COLUMNS.indexOf(task.status);
  const canMoveBackward = currentColumnIndex > 0;
  const canMoveForward = currentColumnIndex < KANBAN_COLUMNS.length - 1;

  const moveTask = (newStatus: KanbanStatus) => {
    dispatch({ type: AppActionType.UPDATE_TASK_STATUS, payload: { taskId: task.id, newStatus } });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete task: "${task.title}"? This action cannot be undone.`)) {
        dispatch({ type: AppActionType.DELETE_TASK, payload: task.id });
    }
  };

  return (
    <div className="bg-primary-light dark:bg-primary-dark p-3.5 rounded-lg border border-border-light dark:border-border-dark shadow-md space-y-2.5 hover:border-accent-purple/70 dark:hover:border-accent-purple/70 transition-all duration-150 group hover:shadow-xl">
      <p className="text-text-primary-light dark:text-text-primary-dark font-medium text-sm leading-snug group-hover:text-accent-purple dark:group-hover:text-accent-purple">{task.title}</p>
      <div className="flex items-center justify-between text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
        <span>XP: {task.xp}</span>
        <span>{new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-border-light/70 dark:border-border-dark/70">
        <div className="flex space-x-1">
          <button
            onClick={() => moveTask(KANBAN_COLUMNS[currentColumnIndex - 1])}
            disabled={!canMoveBackward}
            className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue disabled:opacity-40 disabled:cursor-not-allowed rounded-md hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
            aria-label="Move task backward"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => moveTask(KANBAN_COLUMNS[currentColumnIndex + 1])}
            disabled={!canMoveForward}
            className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue disabled:opacity-40 disabled:cursor-not-allowed rounded-md hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
            aria-label="Move task forward"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 text-accent-red hover:opacity-80 rounded-md hover:bg-accent-red/10 dark:hover:bg-accent-red/20"
          aria-label="Delete task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
