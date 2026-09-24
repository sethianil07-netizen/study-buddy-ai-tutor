import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Add it to your .env file before starting the server.');
}

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Please enter a question.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is missing. Add GEMINI_API_KEY to .env and restart the server.' });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
          .slice(-12)
      : [];

    const contents = [
      ...safeHistory.map(item => ({
        role: item.role,
        parts: [{ text: item.text.slice(0, 6000) }]
      })),
      { role: 'user', parts: [{ text: message.trim().slice(0, 6000) }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction: `You are Study Buddy, a friendly AI tutor for college and school students.
Explain concepts clearly and accurately, adapting the difficulty to the student's question.
For academic questions, show reasoning and useful steps rather than only giving the final answer.
Use concise Markdown headings (###), bullet or numbered lists, and **bold** for key terms when helpful.
For calculations and chemical/math equations, write them in plain text only — for example
"6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2". Never use LaTeX or dollar-sign math notation
(no $, $$, \\text{}, \\rightarrow, subscript braces, etc.) since the chat UI cannot render it.
If the student asks for a study plan, make it practical and realistic.
If you are uncertain about a fact, say so rather than inventing information.
Keep the tone encouraging but not overly verbose.`,
        maxOutputTokens: 1200
      }
    });

    const answer = response.text?.trim();

    if (!answer) {
      return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
    }

    res.json({ answer });
  } catch (error) {
    // Log full details server-side only; never send stack traces or key info to the browser.
    console.error('Gemini error:', error);

    const status = error?.status;
    let userMessage = "Something went wrong on my end. Please try again in a moment.";
    let httpStatus = 500;

    if (status === 401 || status === 403) {
      userMessage = "Study Buddy can't authenticate with the AI service right now. Please let the site owner know.";
      httpStatus = 500; // never hint that it's specifically a bad key
    } else if (status === 429) {
      userMessage = "Study Buddy is getting a lot of questions right now. Please wait a few seconds and try again.";
      httpStatus = 429;
    } else if (status === 503 || status === 500) {
      userMessage = "The AI tutor is temporarily unavailable. Please try again shortly.";
      httpStatus = 503;
    } else if (
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT' ||
      /fetch failed/i.test(error?.message || '')
    ) {
      userMessage = "I couldn't reach the AI service — please check your internet connection and try again.";
      httpStatus = 503;
    }

    res.status(httpStatus).json({ error: userMessage });
  }
});

app.use((req, res, next) => {
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Study Buddy is running at http://localhost:${PORT}`);
});
