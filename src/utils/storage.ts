import type { InvestmentNote } from '../types';

const STORAGE_KEY = 'decisionstock_notes';

export const getNotes = (): InvestmentNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let notes: InvestmentNote[] = raw ? JSON.parse(raw) : [];
    
    let hasChanges = false;
    const nowStr = new Date().toISOString();

    notes = notes.map(note => {
      // Legacy compatibility
      if (!note.status) {
        note.status = 'active';
        hasChanges = true;
      }

      // Check for expiration
      if (note.status === 'active' && note.targetReviewDate && note.targetReviewDate < nowStr) {
        note.status = 'review_needed';
        hasChanges = true;
      }
      return note;
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    return notes;
  } catch {
    return [];
  }
};

export const getNoteById = (id: string): InvestmentNote | undefined => {
  const notes = getNotes();
  return notes.find(n => n.id === id);
};

export const saveNote = (note: Omit<InvestmentNote, 'id' | 'userId' | 'createdAt' | 'status' | 'targetReviewDate'>): InvestmentNote => {
  const now = new Date();
  let targetReviewDate: string | undefined;

  // Calculate target date based on checkDate
  if (note.checkDate === '1week') {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    targetReviewDate = d.toISOString();
  } else if (note.checkDate === '1month') {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    targetReviewDate = d.toISOString();
  } else if (note.checkDate === 'earnings') {
    const d = new Date(now);
    d.setDate(d.getDate() + 14); // estimate 14 days
    targetReviewDate = d.toISOString();
  } else if (note.checkDate === 'test') {
    const d = new Date(now);
    d.setSeconds(d.getSeconds() - 10); // Expired 10 seconds ago for testing
    targetReviewDate = d.toISOString();
  }

  const newNote: InvestmentNote = {
    ...note,
    id: crypto.randomUUID(),
    userId: 'user_1',
    status: 'active',
    targetReviewDate,
    createdAt: now.toISOString()
  };
  
  const existing = getNotes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newNote, ...existing]));
  
  return newNote;
};
export const updateNoteStatus = (id: string, status: InvestmentNote['status']): void => {
  const notes = getNotes();
  const updated = notes.map(n => n.id === id ? { ...n, status } : n);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
