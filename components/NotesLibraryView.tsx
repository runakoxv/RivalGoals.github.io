
import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { ScrapNote, AppActionType } from '../types';
import NoteEditorModal from './NoteEditorModal';
import { PlusIcon, PencilAltIcon, TrashIcon, DocumentTextIcon } from './icons';

const NotesLibraryView: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { savedNotes } = state;

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<ScrapNote | null>(null);

  const handleCreateNewNote = () => {
    setNoteToEdit(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: ScrapNote) => {
    setNoteToEdit(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      dispatch({ type: AppActionType.DELETE_NOTE, payload: noteId });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-end items-center">
        <button
          onClick={handleCreateNewNote}
          className="bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 text-white font-medium py-2.5 px-5 rounded-lg flex items-center space-x-2 transition-opacity text-sm shadow-md hover:shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Note</span>
        </button>
      </div>

      {savedNotes.length === 0 ? (
        <div className="text-center py-16 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg">
          <DocumentTextIcon className="w-20 h-20 text-text-tertiary-light dark:text-text-tertiary-dark opacity-50 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">Your Note Library is Empty</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">Click "Create New Note" to start capturing your ideas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {savedNotes.map(note => (
            <div key={note.id} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-lg flex flex-col justify-between hover:border-accent-purple/70 dark:hover:border-accent-purple/70 transition-all duration-200 hover:shadow-xl group">
              <div>
                <h3 className="text-md font-semibold text-text-primary-light dark:text-text-primary-dark mb-1.5 truncate group-hover:text-accent-purple dark:group-hover:text-accent-purple" title={note.title}>
                  {note.title}
                </h3>
                <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mb-2">
                  Last updated: {formatDate(note.updatedAt)}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-4 mb-3 h-[80px] overflow-hidden">
                  {note.content || <span className="italic">No content.</span>}
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border-light/70 dark:border-border-dark/70">
                <button
                  onClick={() => handleEditNote(note)}
                  className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-blue rounded-md hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
                  aria-label="Edit note"
                >
                  <PencilAltIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-red rounded-md hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
                  aria-label="Delete note"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NoteEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        noteToEdit={noteToEdit} 
      />
    </div>
  );
};

export default NotesLibraryView;
