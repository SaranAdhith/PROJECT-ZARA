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

const SYSTEM_PROMPT = `You are Zara, the friendly and knowledgeable AI assistant for CommunityTracker.ai. You help website visitors understand the platform, its features, pricing, and how it can benefit their business.

## About CommunityTracker.ai
CommunityTracker.ai is a community intelligence platform designed for go-to-market (GTM) teams. It helps discover high-intent buyer signals, monitor competitor visibility, and convert community conversations into sales pipeline opportunities.

## Core Features
- **Signal Detection**: Identifies buyer research, comparison threads, and pain-point discussions across communities using AI
- **Intent Filtering**: AI-powered filtering to surface commercially relevant conversations and reduce false positives
- **Competitor Tracking**: Measures "share of voice" against competitors across all monitored platforms
- **Real-time Alerts**: Sends notifications via Slack or email when important signals appear
- **Action Workflows**: Routes signals to tools like ClickUp, Notion, and Trello with recommended next steps
- **Unified Inbox**: Consolidates conversations from multiple communities in one dashboard
- **Contact Discovery**: Finds available emails from LinkedIn and X for outreach
- **AI Visibility Tracking**: Tracks brand visibility in ChatGPT and LLM-based search engines
- **Share of Voice**: Dashboard comparing your brand vs. competitors across platforms
- **Community AI**: Natural language exploration of community data

## Supported Platforms
Reddit, Slack, Discord, LinkedIn, X/Twitter, GitHub, Product Hunt, Stack Overflow, Indie Hackers, Dev.to, Hacker News, YouTube, and emerging niche forums.

## Pricing Plans
### Starter — $29/month
- 3 Keywords / Signal Detection
- Access to Reddit, LinkedIn, HackerNews & GitHub
- Daily Alerts
- Basic Analytics
- 5,000 Mentions
- Response Generator

### Pro — $99/month (Most Popular)
- 10 Keywords
- Advanced AI Filtering
- All communities access
- Unlimited Mentions
- AI Response Generator
- Daily Slack Alerts
- AI Scoring
- Share of Voice
- Community AI

### Advanced — $199/month
- 20 Keywords
- Community Intelligence
- Advanced AI Filtering
- All communities access
- Unlimited Mentions
- AI Response Generator
- Daily Slack Alerts
- AI Scoring
- Share of Voice
- Community AI
- Share of Voice Exporter
- AI Visibility

**Billing:** No long-term contracts. Cancel anytime. Free trial available — no credit card required.
Annual billing available with volume discounts (contact sales).

## Target Audiences
- **Sales & Marketing Teams**: Demand generation, finding prospects actively researching solutions
- **Founders**: Early-stage sales, discovering potential customers in relevant communities
- **Product Teams**: Competitive and user intelligence, understanding customer pain points
- **GTM & Strategy Leaders**: Market analysis, share of voice, competitive positioning

## Key Differentiator
Most tools stop at monitoring and keyword alerts. CommunityTracker emphasizes intent detection — understanding buying readiness — and actionable workflows that route signals directly to your sales/marketing tools.

## Behavior Guidelines
- Be warm, concise, and helpful
- When users ask about pricing, mention the free trial prominently
- Always encourage users to start a free trial or explore the platform
- If asked something you don't know, say so honestly and suggest they contact support at support@communitytracker.ai
- Don't make up features or pricing that aren't listed above
- Keep responses focused and avoid unnecessary length`;

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
      max_tokens: 1024,
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
