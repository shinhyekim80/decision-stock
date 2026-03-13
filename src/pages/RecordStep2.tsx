import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useRecordContext } from '../context/RecordContext';
import { saveNote } from '../utils/storage';
import { generateAiFeedback } from '../utils/ai';

export default function RecordStep2() {
  const navigate = useNavigate();
  const { 
    stockName, stockTicker, entryPrice, currency,
    emotion, motive, position,
    question1, question2,
    answer1, setAnswer1, 
    answer2, setAnswer2, 
    checkDate, setCheckDate,
    resetRecord
  } = useRecordContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = answer1.trim() && answer2.trim() && checkDate;

  const handleSubmit = async () => {
    if (!isComplete) return;
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("로그인이 세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate('/login');
        return;
      }

      const draft = {
        stockName,
        stockTicker,
        entryPrice,
        currency,
        tagEmotion: emotion,
        tagMotive: motive,
        tagPosition: position,
        userAnswer1: answer1,
        userAnswer2: answer2,
        checkDate
      };

      const aiSummary = await generateAiFeedback(draft);
      
      const noteId = await saveNote({
        ...draft,
        aiSummary
      } as any, user.uid);

      resetRecord();
      navigate(`/note/${noteId}`, { replace: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(error);
      setIsSubmitting(false);
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 p-6">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="text-slate-500 p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="font-bold text-lg text-slate-800 tracking-tight">논리 점검</span>
        <span className="text-sm font-semibold text-blue-600">2/2</span>
      </header>

      <section className="flex-1 space-y-8">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
              🤖
            </div>
            <p className="text-sm font-bold text-slate-800 leading-snug pt-1">
              {question1}
            </p>
          </div>
          <textarea 
            value={answer1}
            onChange={e => setAnswer1(e.target.value)}
            placeholder="답변을 입력해주세요..." 
            className="w-full bg-white border border-slate-200 rounded-xl p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-sm"
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
              🤖
            </div>
            <p className="text-sm font-bold text-slate-800 leading-snug pt-1">
              {question2}
            </p>
          </div>
          <textarea 
            value={answer2}
            onChange={e => setAnswer2(e.target.value)}
            placeholder="답변을 입력해주세요..." 
            className="w-full bg-white border border-slate-200 rounded-xl p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-sm"
          />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6"></div>

        <div>
          <h3 className="block text-sm font-bold text-slate-700 mb-3">이 판단의 유통기한은 언제까지인가요?</h3>
          <select 
            value={checkDate}
            onChange={e => setCheckDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium appearance-none"
          >
            <option value="" disabled>타임캡슐 열어볼 시점 선택</option>
            <option value="test">지금 바로 (테스트용)</option>
            <option value="1week">1주일 뒤</option>
            <option value="1month">1개월 뒤</option>
            <option value="earnings">실적 발표일</option>
          </select>
        </div>
      </section>

      <div className="mt-8 pt-4 pb-6 sticky bottom-0 bg-slate-50/80 backdrop-blur-md">
        <button 
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-2 ${isComplete && !isSubmitting ? 'bg-slate-900 border-slate-800 hover:bg-black text-white' : 'bg-slate-300 text-slate-500 opacity-50 cursor-not-allowed border-transparent'}`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              AI 분석 중...
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              AI 분석 및 저장하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
