import axios from 'axios';

// In local dev, netlify functions are usually on :8888/.netlify/functions/
// In production, they are relative /.netlify/functions/
const BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8888/.netlify/functions' 
  : '/.netlify/functions';

export interface StockSearchResult {
  displaySymbol: string;
  symbol: string;
  description: string;
  type: string;
}

export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  if (query.length < 2) return [];
  try {
    const response = await axios.get(`${BASE_URL}/stock-proxy`, {
      params: { action: 'search', q: query }
    });
    return response.data.result || [];
  } catch (error) {
    console.error('Stock search error:', error);
    return [];
  }
};

export const getQuote = async (symbol: string): Promise<number | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/stock-proxy`, {
      params: { action: 'quote', symbol }
    });
    // c is current price in Finnhub response
    return response.data.c || null;
  } catch (error) {
    console.error('Stock quote error:', error);
    return null;
  }
};
