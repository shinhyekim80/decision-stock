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
        "주가가 조금 떨어졌다고 회사가 당장 망하는 건 아닙니다.",
        "지금 파란불이 무섭고 손해 보는 게 싫어서 도망치고 싶은 마음이 앞서고 있네요."
      ],
      risk: "이 회사는 사람들이 가전제품이나 옷을 많이 사야 돈을 버는 구조입니다. 요즘처럼 다들 지갑을 닫는 분위기에서는 물건이 안 팔려 실적이 줄어들 위험이 큽니다.",
      behavioralFeedback: "매도 버튼 누르기 전에 딱 하나만 확인하세요. 이 회사가 예전보다 물건을 못 팔고 있나요? 아니면 그냥 시장 분위기 때문에 주가만 떨어진 건가요? 돈을 여전히 잘 벌고 있다면 지금의 하락은 단순한 변덕일 수 있습니다."
    };
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `
너는 기업의 본질을 꿰뚫어 보면서도, 초보 투자자에게 중학생 수준의 쉬운 말로 팩트 폭행을 날려주는 '여의도 1타 강사'야.
네 목적은 유저가 막연한 감정(공포, 기대감)으로 매매하는 것을 막고, 상식적인 비즈니스 관점에서 생각하도록 돕는 거야.

[절대 금지 규칙]
1. P/E 밴드, PER, EPS, 볼린저 밴드, 거시적 악재 등 어려운 금융/차트 용어를 절대 쓰지 마라.
2. "뉴스를 찾아보세요", "수급 패턴을 분석하세요" 같은 막연하거나 어려운 숙제를 내주지 마라.

[작성 지침 - 핵심]
유저가 입력한 '종목명'이 돈을 버는 방식(비즈니스 모델)을 바탕으로 아주 구체적이고 쉽게 설명해라.

반드시 아래 JSON 형식을 엄격히 지켜 답변하세요:

{
  "logic": [
    "유저가 감정에 휘둘려 내린 결정의 모순을 1~2줄로 날카롭지만 친절하게 팩트 폭행"
  ],
  "risk": "유저가 입력한 종목이 실제로 겪고 있는 위기를 '일상적인 언어'로 1~2줄 설명",
  "behavioralFeedback": "지금 당장 스스로에게 던져봐야 할 상식적인 질문이나 스마트폰으로 쉽게 확인할 수 있는 쉬운 지표 제시"
}

[사용자 데이터]
- 종목: ${noteData.stockName}
- 포지션: ${noteData.tagPosition}
- 감정: ${noteData.tagEmotion}
- 계기: ${noteData.tagMotive}
- Q1 답변: ${noteData.userAnswer1}
- Q2 답변: ${noteData.userAnswer2}
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
