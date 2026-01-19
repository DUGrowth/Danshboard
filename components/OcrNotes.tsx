'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Trash2, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface OcrNote {
  id: number;
  original_filename: string;
  extracted_text?: string;
  confidence_score?: number;
  category: string;
  tags?: string;
  is_processed: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-gray-500' },
  { value: 'todo', label: 'To-Do', color: 'bg-gray-600' },
  { value: 'idea', label: 'Idea', color: 'bg-gray-400' },
  { value: 'meeting', label: 'Meeting Notes', color: 'bg-gray-300' },
  { value: 'personal', label: 'Personal', color: 'bg-gray-200' }
];

export default function OcrNotes() {
  const [notes, setNotes] = useState<OcrNote[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newNote, setNewNote] = useState({
    filename: '',
    text: '',
    category: 'general'
  });
  const [selectedNote, setSelectedNote] = useState<OcrNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/ocr');
      const data = await res.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.filename.trim() || !newNote.text.trim()) {
      toast.error('Please provide both filename and text');
      return;
    }

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: newNote.filename,
          extractedText: newNote.text,
          category: newNote.category
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setNewNote({ filename: '', text: '', category: 'general' });
        setShowUpload(false);
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const res = await fetch(`/api/ocr?id=${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchNotes();
        setSelectedNote(null);
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-500';
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">OCR Notes</h2>
            <p className="text-sm text-muted-foreground">
              {notes.length} note{notes.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          size="sm"
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Upload form */}
      <AnimatePresence>
        {showUpload && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitNote}
            className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3"
          >
            <p className="text-sm text-muted-foreground">
              📸 Simulate OCR by typing or pasting handwritten note text
            </p>

            <input
              type="text"
              value={newNote.filename}
              onChange={(e) => setNewNote({ ...newNote, filename: e.target.value })}
              placeholder="Note name (e.g., Meeting Notes 2024)"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              autoFocus
            />

            <textarea
              value={newNote.text}
              onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
              placeholder="Paste or type your note content here..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
              rows={4}
            />

            <div className="flex items-center space-x-2">
              <label className="text-xs text-muted-foreground">Category:</label>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setNewNote({ ...newNote, category: cat.value })}
                  className={`px-2 py-1 rounded text-xs font-medium text-white transition-all ${
                    newNote.category === cat.value
                      ? cat.color
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button type="submit" size="sm">
                <Upload className="h-3 w-3 mr-1" />
                Save Note
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Notes grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {notes.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes yet!</p>
            <p className="text-sm">Add handwritten notes to digitize them</p>
          </div>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-muted/30 border border-border rounded-lg hover:border-green-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1 truncate">
                    {note.original_filename}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryColor(note.category)}`}>
                      {CATEGORIES.find(c => c.value === note.category)?.label}
                    </span>
                    {note.confidence_score && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(note.confidence_score)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {note.extracted_text && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {note.extracted_text}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{getTimeSince(note.created_at)}</span>
                {note.is_processed && (
                  <span className="text-green-500 font-medium">✓ Processed</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Note detail modal */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{selectedNote.original_filename}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryColor(selectedNote.category)}`}>
                      {CATEGORIES.find(c => c.value === selectedNote.category)?.label}
                    </span>
                    {selectedNote.confidence_score && (
                      <span className="text-xs text-muted-foreground">
                        Confidence: {Math.round(selectedNote.confidence_score)}%
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedNote(null)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedNote.extracted_text && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedNote.extracted_text}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created {getTimeSince(selectedNote.created_at)}</span>
                <Button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
