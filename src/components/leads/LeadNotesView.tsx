import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  Clock,
  Loader2,
} from 'lucide-react';
import { LeadNote } from '@/src/types/database.ts';

interface LeadNotesViewProps {
  notes: LeadNote[];
  onAddNote: (content: string) => Promise<void>;
  onUpdateNote: (noteId: string, content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export const LeadNotesView: React.FC<LeadNotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newContent);
      setNewContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (note: LeadNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateNote(noteId, editContent);
      setEditingNoteId(null);
      setEditContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    setIsSubmitting(true);
    try {
      await onDeleteNote(noteId);
      setDeletingNoteId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Add Note Form */}
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#E8E9EC] p-4 shadow-2xs">
        <label className="block text-xs font-semibold text-[#171717] mb-1.5">
          Add Team Note
        </label>
        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Record notes on decision makers, outreach angles, commercial context, or qualification details..."
          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717] resize-none"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">
            Visible to all team members working on this lead.
          </span>
          <button
            type="submit"
            disabled={!newContent.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#171717] rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Add Note</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
          Internal Notes ({notes.length})
        </h4>

        {notes.length === 0 ? (
          <div className="p-8 text-center bg-[#F9FAFB] rounded-xl border border-[#E8E9EC]">
            <MessageSquare className="w-6 h-6 text-[#98A1B2] mx-auto mb-2" />
            <p className="text-xs text-[#6B7280]">No notes added for this lead yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notes.map((note) => {
              const isEditing = editingNoteId === note.id;
              const isDeleting = deletingNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-xl border border-[#E8E9EC] p-3.5 hover:border-[#D1D5DB] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-semibold text-zinc-700">
                        {(note.author_name || 'Team Member').slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[#171717]">{note.author_name || 'Team Member'}</span>
                      <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.created_at)}
                      </span>
                    </div>

                    {!isEditing && !isDeleting && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(note)}
                          className="p-1 text-[#6B7280] hover:text-[#171717] rounded hover:bg-[#F3F4F6]"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingNoteId(note.id)}
                          className="p-1 text-[#6B7280] hover:text-red-600 rounded hover:bg-red-50"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#171717]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!editContent.trim() || isSubmitting}
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-[#171717] rounded hover:bg-black"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : isDeleting ? (
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between text-xs text-red-800">
                      <span>Are you sure you want to delete this note?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDeletingNoteId(null)}
                          className="px-2 py-0.5 text-xs text-[#6B7280] hover:text-[#171717]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          className="px-2.5 py-0.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#374151] whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
