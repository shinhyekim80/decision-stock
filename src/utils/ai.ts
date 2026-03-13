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
        `${noteData.tagMotive} 상황에서 ${noteData.tagEmotion}의 영향을 크게 받은 진입입니다.`,
        "명확한 펀더멘털 분석보다는 주변의 화제성이나 흐름을 놓치지 않으려는 심리가 강해 보입니다."
      ],
      risk: "기술적 흐름이나 소문에만 의존할 경우, 기업 본연의 가치 훼손이나 시장의 갑작스러운 변동에 대응하기 어렵습니다.",
      behavioralFeedback: "남들이 다 수익을 내는 상황에서 나만 소외될까 봐 조급해진 마음이 앞서고 계신 것 같네요. 평소라면 꼼꼼히 따져봤을 높은 가격임에도 '지금 아니면 안 된다'는 생각에 뛰어드는 현상이 관찰됩니다. 매수 버튼을 누르기 전에 스스로에게 물어보세요. '남들의 추천이나 화제성을 걷어내고도, 이 기업의 실적만 보고 지금 가격에 살 매력이 충분한가?'"
    };
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `
너는 유저의 투자 심리를 꿰뚫어 보고, 감정에 휘둘린 뇌동매매를 막아주는 통찰력 있는 투자 멘토야.
어려운 금융/심리학 전문 용어(예: 확증 편향, FOMO 등)나 영단어는 절대 사용하지 마.
대신, 유저가 왜 그런 감정을 느끼고 판단을 내렸는지 그 '현상'을 일상적인 언어로 날카롭고 친절하게 풀어서 설명해줘.

[사용자 데이터]
- 종목: ${noteData.stockName}
- 포지션: ${noteData.tagPosition}
- 감정: ${noteData.tagEmotion}
- 계기: ${noteData.tagMotive}
- Q1 답변: ${noteData.userAnswer1}
- Q2 답변: ${noteData.userAnswer2}

반드시 아래 JSON 형식을 엄격히 지켜 답변하세요:

{
  "logic": [
    "핵심 판단 근거 1~2줄 요약",
    "해당 근거가 논리적인지 단순 감정/추측인지 진단"
  ],
  "risk": "간과하기 쉬운 위험 요소(수급, 차트, 테마 등) 1~2줄 경고",
  "behavioralFeedback": "전문 용어 없이 유저의 현재 심리 상태를 공감하며 날카롭게 묘사하고, 이성을 찾을 수 있는 객관적인 질문이나 지표 확인 행동 제시"
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
