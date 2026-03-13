import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes } from '../utils/storage';
import type { InvestmentNote } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<InvestmentNote[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const reviewNeededNotes = notes.filter(n => n.status === 'review_needed');

  const { temp, status, color, bgColor, icon } = useMemo(() => {
    if (notes.length === 0) return { temp: 50, status: '평온', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: '☁️' };
    
    // 점수 할당: 부정적/충동적 감정 높을수록 온도 상승, 안정적 감정일수록 유지/하락
    let totalScore = 0;
    notes.forEach(n => {
      switch(n.tagEmotion) {
        case '조급함 (FOMO)': totalScore += 90; break;
        case '불안/공포': totalScore += 80; break;
        case '본전 심리': totalScore += 85; break;
        case '단순 기대감': totalScore += 65; break;
        case '자신감': totalScore += 40; break;
        case '여유로움': totalScore += 20; break;
        default: totalScore += 50; break; // 기타
      }
    });

    const avg = Math.round(totalScore / notes.length);
    
    if (avg >= 80) return { temp: avg, status: '위험', color: 'text-red-500', bgColor: 'bg-red-100 text-red-700', icon: '🔥' };
    if (avg >= 60) return { temp: avg, status: '주의', color: 'text-orange-500', bgColor: 'bg-orange-100 text-orange-700', icon: '🌡️' };
    if (avg >= 40) return { temp: avg, status: '적정', color: 'text-green-500', bgColor: 'bg-green-100 text-green-700', icon: '🌱' };
    return { temp: avg, status: '안정', color: 'text-blue-500', bgColor: 'bg-blue-100 text-blue-700', icon: '🧊' };
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (filter === 'ALL') return notes;
    if (filter === 'REVIEW_NEEDED') return notes.filter(n => n.status === 'review_needed');
    if (filter === '기타') return notes.filter(n => !['조급함 (FOMO)', '불안/공포', '본전 심리', '단순 기대감', '자신감', '여유로움'].includes(n.tagEmotion));
    return notes.filter(n => n.tagEmotion === filter);
  }, [notes, filter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">DecisionStock</h1>
        <button className="p-2 rounded-full bg-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </header>

      {reviewNeededNotes.length > 0 && (
        <div 
          onClick={() => {
            setFilter('REVIEW_NEEDED');
            window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll to the list
          }}
          className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 shadow-sm cursor-pointer flex justify-between items-center hover:bg-red-100 transition-colors animate-pulse-subtle"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚨</span>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-red-700">과거의 내가 남긴 투자 오답노트 {reviewNeededNotes.length}건을 점검할 시간입니다.</span>
              <span className="text-xs text-red-500 font-medium mt-0.5">지금 아래 목록에서 빨간색 노트를 눌러 확인하세요.</span>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 rotate-90"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      )}

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-60"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">오늘의 투자,<br/>감인가요 데이터인가요?</h2>
        <p className="text-slate-500 mb-6 text-sm">기록이 모이면 나침반이 됩니다.</p>
        <button 
          onClick={() => navigate('/record/step1')}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white py-4 rounded-xl font-bold text-lg shadow-md flex justify-center items-center gap-2"
        >
          새 투자 기록하기
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </section>

      {/* Pattern Dashboard */}
      {notes.length > 0 && (
        <section className="mb-8 flex gap-3">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base leading-none">{icon}</span>
              <span className="text-xs text-slate-400 font-bold tracking-wider">나의 감정 매매 온도</span>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-extrabold ${color}`}>{temp}도</span>
              <span className={`text-xs font-bold mb-1 px-2 py-0.5 rounded-md ${bgColor}`}>{status}</span>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl shadow-sm border border-slate-700 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base leading-none">📝</span>
              <span className="text-xs text-blue-200 font-bold tracking-wider">총 투자 노트</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-white">{notes.length}</span>
              <span className="text-xs text-slate-400 font-medium mb-1">건</span>
            </div>
          </div>
        </section>
      )}

      <section className="flex-1">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-800">최근 내 투자 노트</h3>
        </div>
        
        {/* Filter Scroll Container */}
        {notes.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-2 mb-2 no-scrollbar">
            {['ALL', 'REVIEW_NEEDED', '조급함 (FOMO)', '불안/공포', '본전 심리', '단순 기대감', '자신감', '여유로움', '기타'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filter === f 
                    ? (f === 'REVIEW_NEEDED' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white')
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {f === 'ALL' ? '전체' : f === 'REVIEW_NEEDED' ? '📍 복기 필요' : f}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="bg-slate-100 rounded-xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
              <span className="text-4xl mb-3">{notes.length === 0 ? '📝' : '🔍'}</span>
              <p className="text-slate-600 font-medium leading-relaxed">
                {notes.length === 0 ? '아직 기록된 내용이 없네요. 오늘의 투자를 잊기 전에 남겨보세요!' : '조건에 맞는 노트가 없습니다.'}
              </p>
              {notes.length === 0 && (
                <button 
                  onClick={() => navigate('/record/step1')}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 px-6 rounded-xl font-bold text-sm shadow-md flex justify-center items-center gap-2"
                >
                  기록 시작하기
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/note/${note.id}`)}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    {note.status === 'review_needed' && (
                      <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black w-fit animate-pulse">기록 점검</span>
                    )}
                    <h4 className="font-bold text-slate-800">{note.stockName || '종목 미상'}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                    note.tagPosition === '매수' ? 'bg-blue-50 text-blue-600' :
                    note.tagPosition === '매도' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {note.tagPosition}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium border border-slate-200">
                    {note.tagEmotion}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2.5">
                  <span className="text-sm mt-0.5">🤖</span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {note.aiSummary 
                      ? `AI: ${note.aiSummary.behavioralFeedback}` 
                      : "AI: 감정적인 접근일 수 있습니다. 자세한 분석을 확인해보세요."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
