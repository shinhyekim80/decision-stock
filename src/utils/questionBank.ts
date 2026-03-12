/**
 * Question Bank for Dynamic AI Questions in RecordStep2.
 * Questions are selected based on user's emotion and motive tags from RecordStep1.
 */

// Default / fallback questions
const defaultQuestion1 = '이 종목을 선택하게 된 핵심 근거를 한 문장으로 정리해보세요.';
const defaultQuestion2 = '목표 수익률과 손절 기준을 미리 설정해두셨나요?';

/** One question per emotion tag */
export const emotionQuestions: Record<string, string> = {
  'FOMO': '지금 사지 않으면 기회를 놓칠 것 같은 조급함(FOMO)이 느껴지시나요? 그 조급함이 없다면, 이 종목을 지금 사야 할 이유가 무엇인가요?',
  '강한 확신': '현재의 강한 확신은 어떤 데이터 또는 근거에서 비롯된 건가요? 반대 시나리오도 검토해 보셨나요?',
  '불안함': '지금 불안한 이유가 시장의 외부 노이즈 때문인가요, 아니면 이 기업의 펀더멘털에 실제 문제가 있어서인가요?',
  '단순 호기심': '호기심에서 시작했다면, 이 종목이 포트폴리오에 들어올 만한 구체적인 이유가 있나요?',
};

/** One question per motive tag */
export const motiveQuestions: Record<string, string> = {
  '뉴스/공시': '해당 뉴스나 공시가 이미 주가에 반영되었을 가능성은 없나요? 지금 진입이 늦은 대응은 아닌지 확인해보세요.',
  '유튜브/지인 추천': '외부 추천으로 관심을 갖게 되셨군요. 추천한 사람의 의견 外에, 직접 기업 실적이나 산업 전망을 확인해보셨나요?',
  '가격 급락': '가격이 많이 떨어졌다고 느끼시나요? 이 하락이 단순 조정인지, 기업 가치 자체가 훼손된 것인지 구분해보세요.',
  '차트/수급': '기술적 분석(차트)이 근거라면, 현재 매수 시그널을 뒷받침하는 펀더멘털 요인이 함께 있나요?',
};

/**
 * Picks one question per selected tag.
 * Falls back to a default if no matching question is found.
 */
export const getQuestionsForTags = (emotion: string, motive: string): [string, string] => {
  const q1 = emotionQuestions[emotion] ?? defaultQuestion1;
  const q2 = motiveQuestions[motive] ?? defaultQuestion2;
  return [q1, q2];
};
