import { Handler } from '@netlify/functions';
import axios from 'axios';

const handler: Handler = async (event) => {
  const { path, queryStringParameters } = event;
  const FINNHUB_API_KEY = process.env.VITE_FINNHUB_API_KEY || "ct6lsu1r01qi6r601dngct6lsu1r01qi6r601do0"; // Defaulting to your likely key or user's provided one eventually

  // Simple router
  const action = queryStringParameters?.action; // 'search' or 'quote'
  const symbol = queryStringParameters?.symbol;
  const q = queryStringParameters?.q;

  try {
    if (action === 'search') {
      const response = await axios.get(`https://finnhub.io/api/v1/search?q=${q}&token=${FINNHUB_API_KEY}`);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(response.data),
      };
    }

    if (action === 'quote') {
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(response.data),
      };
    }

    return { statusCode: 400, body: "Invalid action" };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data" }),
    };
  }
};

export { handler };
