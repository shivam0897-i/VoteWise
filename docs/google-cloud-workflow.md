# Google Cloud Workflow

VoteWise can run as a static Cloud Run frontend while routing AI traffic through Google Cloud Functions.

Production project: `utility-ridge-494115-u8`
Cloud Run service: `votewise`
Region: `us-central1`

## Services

- Cloud Run serves the Vite production build through Nginx.
- Cloud Functions proxies Gemini API calls so browser code does not need the production API key.
- Gemini API powers chat, quiz generation, and live election pulse enrichment.
- Google Search grounding is enabled for date-sensitive civic facts.
- BigQuery can store anonymized request telemetry from the proxy.
- Cloud Storage can host the public `election-data.json` feed used by `ELECTION_DATA_URL`.
- Google Maps Embed API powers the optional polling-booth map.
- Google Translate, Google Fonts, and Material Icons support multilingual UI and visual clarity.

## Production Environment Variables

Frontend Cloud Run:

```text
GEMINI_PROXY_URL=https://YOUR_FUNCTION_URL
GEMINI_MODEL=gemini-2.5-flash
ELECTION_DATA_URL=https://storage.googleapis.com/YOUR_BUCKET/election-data.json
GOOGLE_MAPS_KEY=YOUR_MAPS_EMBED_KEY
ENABLE_SEARCH_GROUNDING=true
```

Cloud Function:

```text
GEMINI_API_KEY=stored in Secret Manager
GEMINI_MODEL=gemini-2.5-flash
ALLOWED_ORIGINS=https://votewise-197581117874.us-central1.run.app;https://votewise-q3vjxl35qa-uc.a.run.app
BIGQUERY_DATASET=votewise_analytics
BIGQUERY_TABLE=ai_requests
```

## Deploy

```bash
gcloud config set project utility-ridge-494115-u8
```

Deploy the Gemini proxy:

```bash
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

Deploy the frontend:

```bash
gcloud run deploy votewise \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_PROXY_URL=https://YOUR_FUNCTION_URL,GEMINI_MODEL=gemini-2.5-flash,ELECTION_DATA_URL=https://storage.googleapis.com/YOUR_BUCKET/election-data.json,GOOGLE_MAPS_KEY=YOUR_MAPS_EMBED_KEY,ENABLE_SEARCH_GROUNDING=true"
```
