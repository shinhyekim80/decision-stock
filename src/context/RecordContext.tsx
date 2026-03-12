import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { RecordContextType } from '../types';
import { getQuestionsForTags } from '../utils/questionBank';

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export function RecordProvider({ children }: { children: ReactNode }) {
  const [stockName, setStockName] = useState('');
  const [emotion, setEmotion] = useState('');
  const [motive, setMotive] = useState('');
  const [position, setPosition] = useState('');

  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [checkDate, setCheckDate] = useState('');

  // Derive the two AI questions whenever emotion or motive changes
  const [question1, question2] = useMemo(
    () => getQuestionsForTags(emotion, motive),
    [emotion, motive]
  );

  const resetRecord = () => {
    setStockName('');
    setEmotion('');
    setMotive('');
    setPosition('');
    setAnswer1('');
    setAnswer2('');
    setCheckDate('');
  };

  return (
    <RecordContext.Provider
      value={{
        stockName, setStockName,
        emotion, setEmotion,
        motive, setMotive,
        position, setPosition,
        question1,
        question2,
        answer1, setAnswer1,
        answer2, setAnswer2,
        checkDate, setCheckDate,
        resetRecord
      }}
    >
      {children}
    </RecordContext.Provider>
  );
}

export function useRecordContext() {
  const context = useContext(RecordContext);
  if (context === undefined) {
    throw new Error('useRecordContext must be used within a RecordProvider');
  }
  return context;
}
