// backend/src/routes/aiRoutes.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/parse-segment
 */
router.post('/parse-segment', async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `Convert this customer segmentation request into JSON rules:
    "${text}"

    Rules format example:
    [
      { "field": "attributes.totalSpending", "operator": ">", "value": 1000 },
      { "field": "attributes.visits", "operator": "<", "value": 3 }
    ]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;
    const json = JSON.parse(content);
    res.json({ rules: json });
  } catch (err) {
    console.error('Parse-segment error:', err);
    res.status(500).json({ error: 'AI parsing failed' });
  }
});

/**
 * POST /api/ai/suggest-messages
 */
router.post('/suggest-messages', async (req, res) => {
  try {
    const { objective } = req.body;

    const prompt = `Create 3 short marketing messages for a campaign with objective: "${objective}".
Messages should:
- Include {{name}} placeholder
- Be under 120 characters
- Be friendly and engaging`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const messages = content
      .split('\n')
      .filter((m) => m.trim())
      .map((m) => m.replace(/^\d+\.\s*/, ''));

    res.json({ messages });
  } catch (err) {
    console.error('Suggest-messages error:', err);
    res.status(500).json({ error: 'AI message suggestion failed' });
  }
});

/**
 * POST /api/ai/summary
 */
router.post('/summary', async (req, res) => {
  try {
    const { stats } = req.body;

    const prompt = `Write a short, clear summary of these campaign stats in 2-3 sentences:
${JSON.stringify(stats)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const summary = completion.choices[0].message.content.trim();
    res.json({ summary });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'AI summary failed' });
  }
});

/**
 * POST /api/ai/analytics
 */
router.post('/analytics', async (req, res) => {
  try {
    const { customers, orders } = req.body;

    const prompt = `You are an expert CRM analyst.
Here is customer data: ${JSON.stringify(customers)}
Here are orders: ${JSON.stringify(orders)}

1. Summarize key insights in simple English (max 4 sentences).
2. Suggest 2-3 actionable recommendations for the business owner.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const content = completion.choices[0].message.content.trim();

    // Split insights vs recommendations (basic parsing)
    const [insightsPart, recPart] = content.split(/2\./);

    res.json({
      insights: insightsPart?.replace(/^1\./, '').trim(),
      recommendations: recPart?.trim(),
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'AI analytics failed' });
  }
});






export default router;
