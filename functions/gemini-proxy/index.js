import 'dotenv/config';
import functions from '@google-cloud/functions-framework';
import { BigQuery } from '@google-cloud/bigquery';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT =
  process.env.GEMINI_ENDPOINT ||
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '*')
  .split(/[;,]/)
  .map((origin) => origin.trim())
  .filter(Boolean);
const BIGQUERY_DATASET = process.env.BIGQUERY_DATASET || '';
const BIGQUERY_TABLE = process.env.BIGQUERY_TABLE || 'ai_requests';

const bigquery = BIGQUERY_DATASET ? new BigQuery() : null;

functions.http('geminiProxy', async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed' } });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: 'GEMINI_API_KEY is not configured' } });
    return;
  }

  const feature = sanitizeFeature(req.body?.feature);
  const request = req.body?.request;

  if (!isGeminiRequest(request)) {
    res.status(400).json({ error: { message: 'Invalid Gemini request payload' } });
    return;
  }

  try {
    const upstream = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const payload = await upstream.json().catch(() => ({}));

    await logRequest({
      feature,
      status: upstream.status,
      ok: upstream.ok,
      model: GEMINI_MODEL,
    });

    res.status(upstream.status).json(payload);
  } catch (err) {
    await logRequest({
      feature,
      status: 500,
      ok: false,
      model: GEMINI_MODEL,
    });
    res.status(500).json({ error: { message: err.message || 'Gemini proxy failed' } });
  }
});

function setCorsHeaders(req, res) {
  const requestOrigin = req.get('origin');
  const allowedOrigin =
    ALLOWED_ORIGINS.includes('*') || !requestOrigin
      ? ALLOWED_ORIGINS[0]
      : ALLOWED_ORIGINS.includes(requestOrigin)
        ? requestOrigin
        : ALLOWED_ORIGINS[0];

  res.set('Access-Control-Allow-Origin', allowedOrigin);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Vary', 'Origin');
}

function sanitizeFeature(value) {
  return typeof value === 'string' && /^[a-z0-9-]{1,40}$/.test(value) ? value : 'general';
}

function isGeminiRequest(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (Array.isArray(value.contents) || value.system_instruction)
  );
}

async function logRequest(row) {
  if (!bigquery) return;

  try {
    await bigquery.dataset(BIGQUERY_DATASET).table(BIGQUERY_TABLE).insert([
      {
        ...row,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn('[VoteWise proxy] BigQuery logging skipped:', err.message);
  }
}
