
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppActionType, ScrapNote } from '../types';
import { XIcon, SaveIcon, TrashIcon, PencilAltIcon } from './icons';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: ScrapNote | null; 
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ isOpen, onClose, noteToEdit }) => {
  const { state, dispatch } = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNewNote, setIsNewNote] = useState(true);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setIsNewNote(false);
    } else {
      setTitle('');
      setContent('');
      setIsNewNote(true);
    }
  }, [noteToEdit, isOpen]); 

  const generateTitleFromContent = useCallback((text: string): string => {
    if (!text.trim()) return "Untitled Note";
    const firstLine = text.split('\n')[0].trim();
    return firstLine.substring(0, 50) || "Untitled Note"; 
  }, []);

  const handleSave = () => {
    const finalTitle = title.trim() || generateTitleFromContent(content);
    if (isNewNote) {
      dispatch({ type: AppActionType.ADD_NOTE, payload: { title: finalTitle, content } });
    } else if (noteToEdit) {
      dispatch({ type: AppActionType.UPDATE_NOTE, payload: { ...noteToEdit, title: finalTitle, content } });
    }
    onClose();
  };

  const handleClear = () => {
    setContent("");
    if (!title && !isNewNote) setTitle(generateTitleFromContent("")); 
  };

  if (!isOpen) {
    return null; 
  }

  const inputClass = "w-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark p-2.5 rounded-lg border border-border-light dark:border-border-dark focus:ring-2 focus:ring-accent-purple focus:border-transparent focus:outline-none text-sm";
  const buttonSecondaryClass = "px-4 py-2 text-sm bg-surface-light dark:bg-surface-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark rounded-lg transition-colors border border-border-light dark:border-border-dark flex items-center space-x-1.5 disabled:opacity-50";


  return (
    <div className="fixed inset-0 bg-primary-dark/50 dark:bg-primary-dark/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glassmorphic p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg flex flex-col space-y-4 border border-border-light dark:border-border-dark">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center">
            <PencilAltIcon className="w-5 h-5 mr-2 text-accent-purple"/>
            {isNewNote ? 'Create New Note' : 'Edit Note'}
          </h2>
          <button onClick={onClose} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark p-1.5 rounded-full hover:bg-surface-light/50 dark:hover:bg-surface-dark/50">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title (optional)"
          className={inputClass}
          aria-label="Note title"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jot down your thoughts, ideas, or to-dos..."
          className={`${inputClass} h-60 resize-none`}
          aria-label="Note content"
          autoFocus={isNewNote} 
        />
        <div className="flex justify-end items-center space-x-3 pt-3 border-t border-border-light dark:border-border-dark">
          <button
            onClick={handleClear}
            className={buttonSecondaryClass}
            aria-label="Clear note content"
            disabled={!content}
          >
            <TrashIcon className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 text-white rounded-lg transition-opacity flex items-center space-x-1.5 font-medium disabled:opacity-50"
            aria-label={isNewNote ? "Save Note" : "Update Note"}
            disabled={!content.trim() && !title.trim()}
          >
             <SaveIcon className="w-4 h-4" />
            <span>{isNewNote ? "Save Note" : "Update Note"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorModal;
