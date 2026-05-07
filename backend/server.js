import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import { randomUUID } from 'crypto';

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000;

const SYSTEM_PROMPT = `You are Zara, the friendly AI assistant for CommunityTracker.ai. Your goal is to help website visitors quickly understand the platform and guide them toward starting a free trial.

## Response Rules — follow these strictly
- Keep answers short and direct: 2–4 sentences for simple questions, a brief bullet list for features or pricing comparisons
- Never exceed 130 words unless the visitor explicitly asks for a detailed explanation
- Always end with a clear next step — start a free trial at communitytracker.ai, view pricing, or contact support
- If a question has nothing to do with CommunityTracker (e.g. cooking, sports, general AI questions), respond with: "I'm here specifically to help with questions about CommunityTracker.ai — feel free to ask me about our features, pricing, or how we can help your team!"
- Never invent features, integrations, or pricing not listed below. If unsure, say so and direct them to support@communitytracker.ai
- When someone says they want to sign up, try the platform, or start a trial — send them to communitytracker.ai immediately

## About CommunityTracker.ai
A community intelligence platform for go-to-market (GTM) teams. It discovers high-intent buyer signals, monitors competitor visibility, and converts community conversations into sales pipeline opportunities.

## Core Features
- **Signal Detection**: Finds buyer research, comparison threads, and pain-point discussions across communities using AI
- **Intent Filtering**: Surfaces only commercially relevant conversations — reduces false positives
- **Competitor Tracking**: Measures share of voice against competitors across all monitored platforms
- **Real-time Alerts**: Slack or email notifications when important signals appear
- **Action Workflows**: Routes signals to ClickUp, Notion, and Trello with recommended next steps
- **Unified Inbox**: All community conversations in one dashboard
- **Contact Discovery**: Finds emails from LinkedIn and X for outreach
- **AI Visibility Tracking**: Tracks brand presence in ChatGPT and LLM-based search engines
- **Share of Voice**: Dashboard comparing your brand vs. competitors
- **Community AI**: Ask questions about your community data in plain English

## Supported Platforms
Reddit, Slack, Discord, LinkedIn, X/Twitter, GitHub, Product Hunt, Stack Overflow, Indie Hackers, Dev.to, Hacker News, YouTube, and emerging niche forums.

## Pricing Plans
### Starter — $29/month
- 3 Keywords, Reddit + LinkedIn + HackerNews + GitHub only
- Daily Alerts, Basic Analytics, 5,000 Mentions, Response Generator

### Pro — $99/month (Most Popular)
- 10 Keywords, all communities, Unlimited Mentions
- Advanced AI Filtering, AI Scoring, Share of Voice, Community AI
- Daily Slack Alerts, AI Response Generator

### Advanced — $199/month
- 20 Keywords, all communities, Unlimited Mentions
- Everything in Pro + Share of Voice Exporter + AI Visibility Tracking
- Community Intelligence, Advanced AI Filtering

**Billing:** No contracts. Cancel anytime. Free trial — no credit card required. Annual billing with volume discounts available (contact sales).

## Who It's Built For
- **Sales & Marketing Teams**: Find prospects actively researching solutions in communities
- **Founders**: Discover early customers through relevant conversations
- **Product Teams**: Gather competitive and user intelligence
- **GTM & Strategy Leaders**: Market analysis and competitive positioning

## Key Differentiator
Most tools give you raw mentions. CommunityTracker adds intent detection — it tells you which conversations show actual buying readiness — then routes those signals directly into your sales workflow. That's the difference between noise and pipeline.`;

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TTL_MS) sessions.delete(id);
  }
}
setInterval(cleanExpiredSessions, 5 * 60 * 1000);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin === 'null' || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10kb' }));

app.post('/api/session', (req, res) => {
  const sessionId = randomUUID();
  sessions.set(sessionId, { messages: [], lastActive: Date.now() });
  res.json({ sessionId });
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long.' });
  }
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid or expired session. Please refresh.' });
  }

  const session = sessions.get(sessionId);
  session.lastActive = Date.now();
  session.messages.push({ role: 'user', content: message.trim() });

  if (session.messages.length > 20) {
    session.messages = session.messages.slice(-20);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...session.messages,
      ],
      max_tokens: 600,
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    session.messages.push({ role: 'assistant', content: fullResponse });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong. Please try again.' })}\n\n`);
    res.end();
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', model: 'llama-3.3-70b-versatile' }));

app.listen(PORT, () => {
  console.log(`Zara backend running on http://localhost:${PORT} (Llama 3.3 70B via Groq)`);
});
