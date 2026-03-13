export interface InvestmentNote {
  id: string;
  userId: string;
  stockName: string;
  stockTicker?: string; // Ticker from API (e.g., AAPL)
  entryPrice?: number; // Price at the time of recording
  currency?: string; // USD, KRW etc
  currentPrice?: number;
  tagMotive: string;
  tagEmotion: string;
  tagPosition: string;
  userAnswer1: string;
  userAnswer2: string;
  checkDate: string;
  targetReviewDate?: string; // Calculated absolute date
  status: 'active' | 'review_needed' | 'closed' | 'reviewed'; // Review flow state
  stopLossCondition?: string;
  aiSummary?: {
    logic: string[];
    risk: string;
    behavioralFeedback: string;
  };
  createdAt: string;
}

export type RecordContextType = {
  // Step 1 Data
  stockName: string;
  setStockName: (val: string) => void;
  stockTicker: string;
  setStockTicker: (val: string) => void;
  entryPrice: number;
  setEntryPrice: (val: number) => void;
  currency: string;
  setCurrency: (val: string) => void;
  emotion: string;
  setEmotion: (val: string) => void;
  motive: string;
  setMotive: (val: string) => void;
  position: string;
  setPosition: (val: string) => void;

  // Derived dynamic questions (computed from emotion + motive)
  question1: string;
  question2: string;

  // Step 2 Data
  answer1: string;
  setAnswer1: (val: string) => void;
  answer2: string;
  setAnswer2: (val: string) => void;
  checkDate: string;
  setCheckDate: (val: string) => void;

  // Actions
  resetRecord: () => void;
  setRecordData: (data: Partial<RecordContextType>) => void;
};
