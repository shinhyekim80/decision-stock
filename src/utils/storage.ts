import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  getDoc
} from 'firebase/firestore';
import type { InvestmentNote } from '../types';

const COLLECTION_NAME = 'notes';

export const getNotes = async (uid: string): Promise<InvestmentNote[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notes: InvestmentNote[] = [];
    
    const nowStr = new Date().toISOString();

    for (const d of querySnapshot.docs) {
      const data = d.data() as any;
      const note: InvestmentNote = { ...data, id: d.id };

      // Expiration check logic (similar to legacy)
      if (note.status === 'active' && note.targetReviewDate && note.targetReviewDate < nowStr) {
        await updateDoc(doc(db, COLLECTION_NAME, d.id), { status: 'review_needed' });
        note.status = 'review_needed';
      }
      notes.push(note);
    }

    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const getNoteById = async (id: string): Promise<InvestmentNote | undefined> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as InvestmentNote;
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    return undefined;
  }
};

export const saveNote = async (
  note: Omit<InvestmentNote, 'id' | 'userId' | 'createdAt' | 'status' | 'targetReviewDate'>,
  uid: string
): Promise<string> => {
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
    d.setDate(d.getDate() + 14);
    targetReviewDate = d.toISOString();
  } else if (note.checkDate === 'test') {
    const d = new Date(now);
    d.setSeconds(d.getSeconds() - 10);
    targetReviewDate = d.toISOString();
  }

  const newNoteData = {
    ...note,
    userId: uid,
    status: 'active',
    targetReviewDate,
    createdAt: now.toISOString()
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), newNoteData);
  return docRef.id;
};

export const updateNoteStatus = async (id: string, status: InvestmentNote['status']): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error('Error updating status:', error);
  }
};
