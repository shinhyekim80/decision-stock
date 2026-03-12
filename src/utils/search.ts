const CHOSEONG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export function getChoseong(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // 한글 음절 가(0xAC00) ~ 힣(0xD7A3)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const index = Math.floor((code - 0xAC00) / 588);
      result += CHOSEONG_LIST[index];
    } else {
      result += str[i];
    }
  }
  return result;
}

export function matchStockSearch(query: string, target: string): boolean {
  if (!query) return true;
  
  const normQuery = query.replace(/\s+/g, '').toLowerCase();
  let normTarget = target.replace(/\s+/g, '').toLowerCase();
  
  // 국기 이모지 등 불필요한 기호 제거하여 검색 정확도 향상
  normTarget = normTarget.replace(/[🇰🇷🇺🇸]/g, '');
  
  // 1. 일반 텍스트 포함 여부 검사
  if (normTarget.includes(normQuery)) {
    return true;
  }
  
  // 2. 초성 검색 검사
  // query가 한글 초성 또는 영문/숫자로만 이루어져 있는지 확인
  const isChoseongQuery = /^[ㄱ-ㅎa-z0-9]+$/.test(normQuery);
  
  if (isChoseongQuery) {
    const targetChoseong = getChoseong(normTarget);
    if (targetChoseong.includes(normQuery)) {
      return true;
    }
  }
  
  return false;
}
