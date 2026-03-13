import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordContext } from '../context/RecordContext';
import { explainTermWithAi } from '../utils/ai';
import { searchStocks, getQuote } from '../utils/stockApi';
import type { StockSearchResult } from '../utils/stockApi';

const EMOTION_TAGS = ['조급함 (FOMO)', '불안/공포', '본전 심리', '단순 기대감', '자신감', '여유로움', '기타 (직접 입력)'];
const MOTIVE_TAGS = ['뉴스/공시', '유튜브/지인 추천', '가격 급락', '차트/수급', '기타 (직접 입력)'];

export default function RecordStep1() {
  const navigate = useNavigate();
  const { 
    stockName, setStockName, 
    emotion, setEmotion, 
    motive, setMotive, 
    position, setPosition,
    setRecordData
  } = useRecordContext();

  const [customEmotion, setCustomEmotion] = useState('');
  const [customMotive, setCustomMotive] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Real-time search states
  const [apiSuggestions, setApiSuggestions] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);

  // AI 용어 검색 모달 상태
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isOtherSelected = emotion === '기타 (직접 입력)';
  const isOtherMotiveSelected = motive === '기타 (직접 입력)';
  const effectiveEmotion = isOtherSelected ? customEmotion.trim() : emotion;
  const effectiveMotive = isOtherMotiveSelected ? customMotive.trim() : motive;
  const isComplete = stockName.trim() && effectiveEmotion && effectiveMotive && position;

  // Real-time Search Effect with Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Don't search if stock matches a selected one or is too short
      const trimmed = stockName.trim();
      if (trimmed.length >= 2 && (!selectedStock || !selectedStock.description.includes(trimmed))) {
        setIsSearching(true);
        const results = await searchStocks(trimmed);
        setApiSuggestions(results.slice(0, 10)); 
        setIsSearching(false);
        setShowDropdown(results.length > 0);
      } else {
        setApiSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [stockName, selectedStock]);

  const handleSelectSuggestion = async (stock: StockSearchResult) => {
    const nameOnly = stock.description.split(' (')[0];
    setStockName(nameOnly);
    setSelectedStock(stock);
    setShowDropdown(false);
    
    // Fetch live price for snapshot in the background
    const price = await getQuote(stock.symbol);
    
    setRecordData({
      stockName: nameOnly,
      stockTicker: stock.symbol,
      entryPrice: price || 0,
      currency: stock.symbol.includes('.') ? 'KRW' : 'USD'
    });
  };

  const handleInputChange = (val: string) => {
    setStockName(val);
    // If the user starts typing again, clear the current selection to allow fresh search
    if (selectedStock && val !== selectedStock.description.split(' (')[0]) {
      setSelectedStock(null);
    }
  };

  const handleEmotionSelect = (tag: string) => {
    setEmotion(tag);
    if (tag !== '기타 (직접 입력)') setCustomEmotion('');
  };

  const handleMotiveSelect = (tag: string) => {
    setMotive(tag);
    if (tag !== '기타 (직접 입력)') setCustomMotive('');
  };

  const toggleTooltip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const CHECKLIST_ITEMS = [
    { id: 'finance', title: '재무 건전성', desc: '매출·이익 추이, ROE, 부채비율 확인했나요?', tooltip: '부채비율 100% 미만이면 아주 건강해요! ROE는 내 돈으로 얼마나 장사를 잘했나 보여주는 지표로 10% 이상이면 훌륭합니다.' },
    { id: 'market', title: '시장 경쟁력', desc: '시장점유율과 경쟁우위, 해외 확장 가능성은?', tooltip: '산업 내 독점력이 있는지, 대체 불가능한 기술력이 있는지 체크해보세요.' },
    { id: 'trend', title: '매매 동향', desc: '외국인·기관의 수급과 거래량 추이는 어떤가요?', tooltip: '거래량은 사람들의 관심도예요! 주가가 오를 때 거래량이 같이 터져야 진짜 상승일 확률이 높아요.' },
    { id: 'risk', title: '리스크 점검', desc: '자본잠식 위험이나 최근 급격한 유상증자 이력은 없나요?', tooltip: '유상증자는 회사가 돈이 없어서 주식을 새로 찍어내는 거예요. 주식 가치가 희석될 수 있으니 꼭 체크하세요!' },
    { id: 'rule', title: '나만의 원칙', desc: '손절가(Stop-loss)와 목표가를 정했나요?', tooltip: '감정에 휘둘리지 않기 위해 처음 진입할 때 엑시트 플랜을 미리 세워두는 것이 핵심입니다.' },
  ];

  const handleAskAi = async () => {
    if (!searchTerm.trim()) return;
    setIsAiLoading(true);
    setAiExplanation('');
    try {
      const explanation = await explainTermWithAi(searchTerm.trim());
      setAiExplanation(explanation);
    } catch (err: any) {
      setAiExplanation(err.message || '오류가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 p-6">
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="font-bold text-lg text-slate-800 tracking-tight">오늘의 투자 히스토리</span>
        <span className="text-sm font-semibold text-blue-600">1/2</span>
      </header>

      <p className="text-base font-bold text-slate-700 mb-8 leading-snug">
        투자 판단을 기록하면<br/>다음 선택이 더 쉬워집니다.
      </p>

      <section className="flex-1 space-y-8">
        {/* Stock Search with Real-time API */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">종목 검색</label>
          <p className="text-xs text-slate-500 mb-3">전 세계 종목명을 입력하고 선택해 주세요. (예: 삼성전자, Apple)</p>
          <div className="relative" ref={dropdownRef}>
            <div className="absolute left-3 top-3.5 text-slate-400 z-10 pointer-events-none">
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              )}
            </div>
            <input 
              type="text" 
              value={stockName}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => stockName.length >= 2 && setShowDropdown(true)}
              placeholder="종목명 또는 심볼을 입력하세요" 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium" 
            />

            {/* API Suggestions Dropdown */}
            {showDropdown && apiSuggestions.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                {apiSuggestions.map(stock => (
                  <li
                    key={stock.symbol}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(stock);
                    }}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm truncate">{stock.description}</span>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{stock.symbol}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{stock.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Emotion Tags */}
        <div>
          <h3 className="block text-sm font-bold text-slate-700 mb-3">지금 이 종목을 대하는 감정은?</h3>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map(tag => (
              <button 
                key={tag} 
                onClick={() => handleEmotionSelect(tag)}
                className={`px-4 py-2 bg-white border rounded-full font-medium text-sm transition-colors ${emotion === tag ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-400'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {isOtherSelected && (
            <input
              type="text"
              value={customEmotion}
              onChange={(e) => setCustomEmotion(e.target.value)}
              placeholder="현재 감정 상태를 직접 입력해주세요"
              autoFocus
              className="mt-3 w-full bg-white border border-blue-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
            />
          )}
        </div>

        {/* Motive Tags */}
        <div>
          <h3 className="block text-sm font-bold text-slate-700 mb-3">어떤 계기로 보게 되셨나요?</h3>
          <div className="flex flex-wrap gap-2">
            {MOTIVE_TAGS.map(tag => (
              <button 
                key={tag} 
                onClick={() => handleMotiveSelect(tag)}
                className={`px-4 py-2 bg-white border rounded-full font-medium text-sm transition-colors ${motive === tag ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-400'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {isOtherMotiveSelected && (
            <input
              type="text"
              value={customMotive}
              onChange={(e) => setCustomMotive(e.target.value)}
              placeholder="어떤 계기인지 짧게 적어주세요"
              autoFocus
              className="mt-3 w-full bg-white border border-blue-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
            />
          )}
        </div>

        {/* Decision */}
        <div>
          <h3 className="block text-sm font-bold text-slate-700 mb-3">현재 내린 결정은?</h3>
          <div className="flex flex-col space-y-3">
            {['매수', '매도', '관망(보류)'].map(decision => (
              <label 
                key={decision} 
                className={`flex items-center space-x-3 bg-white p-4 rounded-xl border cursor-pointer transition-colors ${position === decision ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400'}`}
              >
                <input 
                  type="radio" 
                  name="decision" 
                  checked={position === decision}
                  onChange={() => setPosition(decision)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <span className={`font-medium ${position === decision ? 'text-blue-900' : 'text-slate-700'}`}>{decision}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pre-investment Checklist Accordion */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden mb-6">
          <button 
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            className="w-full flex justify-between items-center p-5 bg-blue-50/50 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="font-bold text-slate-800">투자 전 필수 체크리스트</span>
              {!isChecklistOpen && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">초보자 추천</span>}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-500 transition-transform ${isChecklistOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
          </button>
          
          {isChecklistOpen && (
            <div className="p-5 pt-2 border-t border-blue-100 space-y-4">
              <p className="text-xs text-slate-500 mb-4">버튼을 눌러 모든 항목을 스스로 점검해 보세요. 물음표(?)를 누르면 쉬운 팁을 볼 수 있습니다.</p>
              
              {CHECKLIST_ITEMS.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-sm text-slate-800">{item.title}</span>
                        <button 
                          onClick={(e) => toggleTooltip(item.id, e)}
                          className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold hover:bg-slate-300 transition-colors focus:outline-none"
                        >
                          ?
                        </button>
                      </div>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  {activeTooltip === item.id && (
                    <div className="mt-2 ml-7 p-3 bg-slate-800 rounded-lg shadow-lg relative z-10 animate-fade-in">
                      <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-800 rotate-45"></div>
                      <p className="text-xs text-white leading-relaxed relative z-20">
                        {item.tooltip}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-xs text-slate-500 font-medium flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  🤖 용어가 어려우신가요? AI에게 물어보기
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 pt-4 pb-6 sticky bottom-0 bg-slate-50/80 backdrop-blur-md">
        <button 
          disabled={!isComplete}
          onClick={() => {
            if (isOtherSelected && customEmotion.trim()) setEmotion(customEmotion.trim());
            if (isOtherMotiveSelected && customMotive.trim()) setMotive(customMotive.trim());
            navigate('/record/step2');
          }}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-colors ${isComplete ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-300 text-slate-500 opacity-50 cursor-not-allowed'}`}
        >
          다음 단계로
        </button>
      </div>

      {/* AI Term Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => {
                setIsAiModalOpen(false);
                setSearchTerm('');
                setAiExplanation('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-slate-800 tracking-tight">AI 주식 용어 사전</h3>
              </div>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  placeholder="예: 유상증자, ROE, PBR" 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={handleAskAi}
                  disabled={!searchTerm.trim() || isAiLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {isAiLoading ? '검색 중...' : '검색'}
                </button>
              </div>

              {aiExplanation && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 animate-fade-in">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {aiExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
