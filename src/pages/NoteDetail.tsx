import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, updateNoteStatus } from '../utils/storage';
import type { InvestmentNote } from '../types';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<InvestmentNote | null>(null);

  useEffect(() => {
    if (id) {
      const found = getNoteById(id);
      if (found) {
        setNote(found);
      } else {
        // If not found, maybe redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [id, navigate]);

  const handleMarkAsReviewed = () => {
    if (note) {
      updateNoteStatus(note.id, 'reviewed');
      navigate('/', { replace: true });
    }
  };

  if (!note) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  // Format date
  const dateStr = new Date(note.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 p-6">
      <header className="flex items-center mb-8 relative">
        <button onClick={() => navigate(-1)} className="text-slate-500 p-2 -ml-2 absolute left-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="font-bold text-lg text-slate-800 tracking-tight w-full text-center">투자 노트 상세</span>
      </header>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{note.stockName}</h1>
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-400 text-sm font-medium">{dateStr} 기록됨</span>
          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">-</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{note.tagPosition}</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">{note.tagEmotion}</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{note.tagMotive}</span>
        </div>
      </section>

      {note.aiSummary && (
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl mb-6 border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-full -z-10 blur-xl"></div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🤖</span>
            <h2 className="text-white font-bold text-lg tracking-wide">AI 분석 리포트</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                나의 투자 논리
              </h3>
              <ul className="text-slate-100 text-sm space-y-2 font-medium leading-relaxed pl-1">
                {note.aiSummary.logic.map((line, idx) => (
                  <li key={idx}>- {line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-yellow-500 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                놓치기 쉬운 리스크
              </h3>
              <p className="text-yellow-100 text-sm font-medium leading-relaxed pl-1">
                {note.aiSummary.risk}
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <h3 className="text-blue-300 text-xs font-bold mb-1 uppercase tracking-wider">
                행동 패턴 피드백
              </h3>
              <p className="text-white text-sm font-bold leading-relaxed">
                {note.aiSummary.behavioralFeedback}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mb-8">
        <details className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <summary className="font-bold text-slate-700 px-5 py-4 cursor-pointer flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            내가 남긴 원본 답변 보기
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-open:rotate-180 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div className="p-5 border-t border-slate-100 space-y-4 bg-white">
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1">Q1. 긍정적인 면을 많이 보셨을 텐데, 가장 큰 리스크는?</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{note.userAnswer1}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1">Q2. 5% 빠져도 버틸 수 있는 본질적 가치는?</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{note.userAnswer2}</p>
            </div>
            {note.checkDate && (
              <div>
                 <p className="text-xs text-slate-400 font-bold mb-1">나의 타임캡슐 기한</p>
                 <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{
                   note.checkDate === '1week' ? '1주일 뒤' :
                   note.checkDate === '1month' ? '1개월 뒤' : '실적 발표일'
                 }</p>
              </div>
            )}
          </div>
        </details>
      </section>

      <div className="mt-auto pt-4 pb-6 flex flex-col gap-3">
        {note.status === 'review_needed' && (
          <button 
            onClick={handleMarkAsReviewed} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-base shadow-md transition-colors"
          >
            ✅ 이제 복기를 완료했습니다
          </button>
        )}
        <button 
          onClick={() => navigate('/')} 
          className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-4 rounded-xl font-bold text-base shadow-sm transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
