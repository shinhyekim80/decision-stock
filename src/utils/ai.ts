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
        "명확한 펀더멘털 분석보다는 차트 흐름이나 주변 소식에 의존한 판단으로 보입니다."
      ],
      risk: "기술적 분석에만 치중할 경우 기업 고유의 악재나 시장의 거시적 변동성에 무방비로 노출될 위험이 큽니다.",
      behavioralFeedback: "현재 상태는 '조급함 편향(FOMO, Fear of Missing Out)'이 관찰됩니다. 남들이 수익을 낼 때 소외될까 두려워 무리하게 진입하는 심리죠. 지금 당장 '내가 이 가격에도 남들에게 추천할 수 있는가?'라는 질문을 스스로에게 던져보세요."
    };
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `
당신은 행동재무학(Behavioral Finance)에 정통한, 냉철하지만 다정한 '투자 심리 전담 주치의'입니다.
유저의 투자 기록을 분석하여 인지적 편향과 감정에 휘둘린 뇌동매매를 막고 논리적인 투자를 하도록 돕는 것이 목적입니다.

"감정을 관리하세요" 같은 뻔한 훈계는 배제하고, 논리적이고 객관적인 '의사 선생님' 톤을 유지하세요.

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
  "risk": "간과하기 쉬운 맹점(수급, 차트, 테마 등) 1~2줄 경고",
  "behavioralFeedback": "행동재무학 용어(영문 병기)를 반드시 포함하여 심리 상태를 중학생 수준의 비유로 설명하고, 지금 당장 스스로에게 던져야 할 객관적인 질문 한 가지 제시"
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
