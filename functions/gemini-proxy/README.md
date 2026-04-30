# VoteWise Gemini Proxy

Optional Google Cloud Function for production submissions.

It keeps the Gemini API key server-side, forwards validated Gemini requests, and can write anonymized request telemetry to BigQuery. The function logs only feature name, status, success flag, model, and timestamp. It does not log prompts or user messages.

## Deploy

```bash
gcloud config set project utility-ridge-494115-u8

gcloud functions deploy votewise-gemini-proxy \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-central1 \
  --source=functions/gemini-proxy \
  --entry-point=geminiProxy \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_MODEL=gemini-2.5-flash,ALLOWED_ORIGINS=https://votewise-197581117874.us-central1.run.app;https://votewise-q3vjxl35qa-uc.a.run.app,BIGQUERY_DATASET=votewise_analytics,BIGQUERY_TABLE=ai_requests" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

Then deploy the frontend with:

```bash
gcloud run deploy votewise \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_PROXY_URL=https://YOUR_FUNCTION_URL,GEMINI_MODEL=gemini-2.5-flash,ELECTION_DATA_URL=https://storage.googleapis.com/YOUR_BUCKET/election-data.json,GOOGLE_MAPS_KEY=YOUR_MAPS_EMBED_KEY,ENABLE_SEARCH_GROUNDING=true"
```
