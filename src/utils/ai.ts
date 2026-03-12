import OpenAI from 'openai';
import type { InvestmentNote } from '../types';

export const generateAiFeedback = async (
  noteData: Omit<InvestmentNote, 'id' | 'userId' | 'createdAt' | 'aiSummary' | 'status' | 'targetReviewDate'>
): Promise<{ logic: string[]; risk: string; behavioralFeedback: string }> => {
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Fallback to mock if no API key is set
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      logic: [
        `${noteData.tagMotive} 및 ${noteData.tagEmotion}의 영향을 받은 진입입니다.`,
        `주관식 답변 요약: ${noteData.userAnswer1.substring(0, 20)}...`,
        `API 키가 설정되지 않아 가상 데이터로 응답합니다.`
      ],
      risk: `현재 [${noteData.tagEmotion}] 상태로 인해 객관적인 수익 지표 확인이 누락되었습니다.`,
      behavioralFeedback: `충동적(FOMO/호기심 등) 결정의 성향이 짙습니다. 명확한 목표 매도가를 설정하세요.`
    };
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `
당신은 개인 투자자의 충동적인 의사결정을 방지하고, 논리적인 투자를 돕는 '행동재무학 기반 투자 코치'입니다. 
사용자가 입력한 투자 맥락(종목, 감정, 계기, 결정)과 주관식 답변을 분석하여, 사용자의 투자 논리를 요약하고 숨겨진 리스크를 경고해 주세요.

[사용자 입력 데이터]
- 종목명: ${noteData.stockName}
- 현재 포지션: ${noteData.tagPosition}
- 현재 감정 상태: ${noteData.tagEmotion}
- 투자 계기: ${noteData.tagMotive}
- 질문 1에 대한 답변: ${noteData.userAnswer1}
- 질문 2에 대한 답변: ${noteData.userAnswer2}

[출력 규칙]
반드시 아래의 3가지 항목을 JSON 형식으로만 반환하세요. JSON 외의 부연 설명은 절대 하지 마세요.

{
  "logic": [
    "핵심 투자 논리 1 (개조식)",
    "핵심 투자 논리 2 (개조식)",
    "핵심 투자 논리 3 (개조식)"
  ],
  "risk": "해당 종목의 산업적 특성이나 언급되지 않은 1줄 리스크 경고",
  "behavioralFeedback": "행동재무학 관점에서 본 1줄 피드백"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content returned from OpenAI');
    
    return JSON.parse(content);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('OpenAI Error:', msg);
    throw new Error(`AI 분석 오류: ${msg}`);
  }
};

export const explainTermWithAi = async (term: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `[API 키 미설정] '${term}'에 대한 가상 설명입니다: 관련된 기본 개념을 확인해보는게 좋습니다.`;
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `
당신은 주식 투자를 갓 시작한 초보자를 위한 친절한 금융 선생님입니다.
사용자가 입력한 금융/주식 용어에 대해 중학생도 이해할 수 있을 만큼 아주 쉽고 비유적으로 2~3문장 이내로 설명해 주세요.
너무 길거나 딱딱한 사전적 정의는 피하세요.

용어: ${term}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content || '설명을 불러오지 못했습니다.';
  } catch (error: unknown) {
    console.error('OpenAI Explain Term Error:', error);
    throw new Error('용어 설명을 가져오는 중 오류가 발생했습니다.');
  }
};
