import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action, symbol, q } = req.query;
  const FINNHUB_API_KEY = process.env.VITE_FINNHUB_API_KEY;

  if (!FINNHUB_API_KEY) {
    return res.status(500).json({ error: "Missing API Key" });
  }

  try {
    if (action === 'search') {
      const response = await axios.get(`https://finnhub.io/api/v1/search?q=${q}&token=${FINNHUB_API_KEY}`);
      return res.status(200).json(response.data);
    }

    if (action === 'quote') {
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      return res.status(200).json(response.data);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
}
