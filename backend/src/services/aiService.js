/**
 * convertTextToRules: calls external AI endpoint (OpenAI-compatible) to extract segmentation rules.
 * Expects the AI to return JSON array of rules in the form: [{ field, operator, value }, ...]
 * If AI_API_KEY is not present or call fails, fallback to a naive parser supporting simple patterns:
 *   - "spend > 1000" => { field: 'spend', operator: 'greaterThan', value: 1000 }
 *   - "visits < 3" => { field: 'visits', operator: 'lessThan', value: 3 }
 *   - "country equals US" => { field: 'country', operator: 'equals', value: 'US' }
 */

// backend/src/services/aiService.js
import axios from 'axios';

export const convertTextToRules = async (text) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

  if (!OPENAI_API_KEY) {
    return fallbackParse(text);
  }

  try {
    const prompt = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that converts natural language audience descriptions into JSON array of rules. Each rule should be an object with "field", "operator" (equals, contains, greaterThan, lessThan), and "value".'
      },
      { role: 'user', content: `Convert the following to JSON array of rules: "${text}"` }
    ];

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: prompt,
        max_tokens: 300,
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Try to extract JSON from the assistant reply
    const reply =
      (response.data &&
        response.data.choices &&
        response.data.choices[0] &&
        response.data.choices[0].message &&
        response.data.choices[0].message.content) ||
      '';

    // Try to parse JSON substring
    const jsonStart = reply.indexOf('[');
    const jsonEnd = reply.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = reply.substring(jsonStart, jsonEnd + 1);
      const rules = JSON.parse(jsonStr);
      return rules;
    }

    // If parsing fails, fallback
    return fallbackParse(text);
  } catch (err) {
    return fallbackParse(text);
  }
};

function fallbackParse(text) {
  const rules = [];
  const parts = text.split(/,|and/gi);
  for (const p of parts) {
    const s = p.trim().toLowerCase();
    let m;
    if ((m = s.match(/([\w.]+)\s*>\s*(\d+)/))) {
      rules.push({ field: m[1], operator: 'greaterThan', value: Number(m[2]) });
    } else if ((m = s.match(/([\w.]+)\s*<\s*(\d+)/))) {
      rules.push({ field: m[1], operator: 'lessThan', value: Number(m[2]) });
    } else if ((m = s.match(/([\w.]+)\s*=\s*([\w]+)/))) {
      rules.push({ field: m[1], operator: 'equals', value: m[2] });
    } else if ((m = s.match(/([\w.]+)\s+equals\s+([\w]+)/))) {
      rules.push({ field: m[1], operator: 'equals', value: m[2] });
    } else if ((m = s.match(/([\w.]+)\s+contains\s+([\w]+)/))) {
      rules.push({ field: m[1], operator: 'contains', value: m[2] });
    }
  }
  return rules;
}
