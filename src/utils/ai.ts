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
        "차트와 단기 수급은 후행 지표에 불과합니다.",
        "명확한 펀더멘털 분석 없이 분위기에 편승하려는 전형적인 뇌동매매의 시작으로 보입니다."
      ],
      risk: "현재 해당 섹터는 글로벌 수요 둔화(캐즘)와 원자재 가격 변동이라는 구조적인 압박을 받고 있습니다. 업황의 근본적인 개선 없이는 단기 수급만으로 추세를 되돌리기 어렵습니다.",
      behavioralFeedback: "묻지마 매수를 멈추고 지금 당장 핵심 지표를 확인하십시오. 유입된 수급이 단기 차익용인지 추세적 매집인지 '수급의 질'을 분석하고, 해당 산업의 판가(ASP) 하락세가 진정되었는지 데이터를 직접 확인한 후 행동해도 늦지 않습니다."
    };
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `
너는 여의도와 월스트리트에서 산전수전 다 겪은, 냉혹하지만 실력이 확실한 '실전 펀드매니저 겸 투자 코치'야.
네 목적은 유저의 빈약한 투자 논리를 부수고, 감정에 휘둘린 뇌동매매를 막는 거야.

[절대 금지 규칙]
1. 유저가 입력한 문장을 그대로 요약하거나 반복하지 마라.
2. "뉴스를 찾아보세요", "전문가 의견을 참고하세요" 같은 뻔한 챗봇식 조언은 절대 금지한다.
3. 주식 시장 전체에 통용되는 일반론(예: "차트는 후행 지표다")만 늘어놓지 마라.

[작성 지침]
유저가 입력한 '종목명'을 분석하여, 해당 기업이 속한 산업(섹터)의 핵심 지표나 트렌드를 반드시 1개 이상 구체적으로 언급해라.

반드시 아래 JSON 형식을 엄격히 지켜 답변하세요:

{
  "logic": [
    "판단 근거 중 모순되거나 감정에 치우친 부분 1~2줄 예리하게 지적",
    "논리성/객관성 짧은 진단"
  ],
  "risk": "종목(산업)에 특화된 현재의 거시적/산업적 악재나 리스크 구체적 명시",
  "behavioralFeedback": "지금 당장 MTS에서 확인해야 할 구체적 지표나 액션 지시 (예: 수급의 질 분석, P/E 밴드 확인 등)"
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
