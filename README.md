# VoteWise

VoteWise is a dynamic election-process assistant for Prompt Wars 2026 Challenge 2.
It helps Indian voters understand election timelines, voter-roll checks, forms,
polling-day steps, accessibility support, and official Election Commission
services.

## Chosen Vertical

Civic education / election process guide.

## Product Idea

The target persona is a first-time or confused voter who does not want to read
long government PDFs before knowing what to do next.

VoteWise turns official election guidance into:

- A live election-cycle pulse (real-time via Gemini + Google Search grounding)
- A personalized "Am I ready to vote?" checker with branch-specific guidance
- A 10-step election journey with official source backing
- A polling-booth simulator with Google Maps integration
- A Gemini assistant for neutral civic questions (with local fallback)
- A Gemini-generated quiz with strict JSON schema validation
- Official source links for verification
- 13-language support via Google Translate

## Approach and Logic

The core design principle is **data-driven rendering with graceful degradation**.
No election fact is hardcoded in the UI — everything is sourced from a structured
data layer and rendered dynamically.

**Decision-making architecture:**

1. **Readiness checker** (`readiness.js`): A branching decision engine that
   evaluates user inputs (age, registration status, support needs) and returns
   specific, actionable guidance — not generic advice. Each branch is
   independently tested with 10 unit tests.

2. **Live data enrichment** (`liveData.js`): On page load, Gemini with Google
   Search grounding is used to fetch real-time election status (poll dates,
   results, phases). The response is validated (must contain a non-empty
   `regions` array), cached in `sessionStorage` for 10 minutes, and merged
   immutably with the local dataset. If the API call fails, the app falls back
   to the curated local dataset without any UI disruption.

3. **Quiz generation** (`quiz.js`): Gemini generates election-awareness quizzes
   in strict JSON mode. The output is validated against a schema (4 options per
   question, valid `correctIndex`, non-empty fields) before rendering — malformed
   AI output is rejected, not displayed.

4. **Chat assistant** (`chat.js`): Multi-turn Gemini conversation with a civic
   system prompt. Rate-limited (3 seconds), history-capped (20 messages), and
   locally degradable with canned fallback responses when the API is unavailable.

## How It Works

```
User opens VoteWise
       │
       ├─→ Data layer loads:  local fallback → remote JSON → Gemini live enrichment
       │
       ├─→ UI renders:  election pulse, countdown timers, state cards
       │
       ├─→ User interactions:
       │     ├─ "Am I ready?" → readiness decision engine → personalized steps
       │     ├─ "Find my booth" → EPIC validation → Google Maps embed
       │     ├─ "Ask a question" → Gemini chat with search grounding
       │     ├─ "Take a quiz" → Gemini JSON generation → schema-validated quiz
       │     └─ "Election journey" → 10-step accordion with official sources
       │
       └─→ All modules init in error boundaries — one failure ≠ full crash
```

Every interaction is designed for a first-time voter who may not know election
terminology. The language is plain, the actions are specific, and every claim
links to an official source (ECI, SVEEP, PIB).


## Dynamic Data Approach

Election facts are not embedded directly in the HTML. The UI is rendered from a
data layer with three tiers:

1. **Local fallback**: `src/data/electionData.js` — always available, zero-latency
2. **Remote feed**: `public/election-data.json` — updatable without code changes
3. **Live enrichment**: Gemini + Google Search grounding fetches real-time election
   status on page load, cached in `sessionStorage` for 10 minutes

This keeps the app usable without a backend while allowing the election cycle,
states, dates, sources, timeline steps, tools, and suggested questions to be
updated without rewriting the UI.

## Google Services

| Service | Purpose | Module |
|---|---|---|
| **Gemini API** | AI chatbot + quiz generation | `api.js`, `chat.js`, `quiz.js` |
| **Gemini Search Grounding** | Real-time election data enrichment | `liveData.js` |
| **Google Translate** | 13-language multilingual UI | `index.html` (custom pill UI) |
| **Google Maps Embed** | Location-aware polling booth finder | `simulator.js` |
| **Google Fonts** | Multilingual typography (Noto Sans + Anek Latin) | `main.css` |
| **Material Icons** | Accessible icon system | Throughout |

All services degrade gracefully — no API key means the feature is skipped, not
that the app crashes.

## Security

### Implemented Protections

- **Content Security Policy (CSP)**: Strict `<meta>` CSP restricts scripts,
  styles, fonts, frames, and connections to known Google origins only.
- **XSS prevention**: All user and AI text rendered via `textContent` / `createTextNode`.
  No `innerHTML` with untrusted data anywhere in the codebase. Regression-tested
  in `dom.test.js`.
- **Schema validation**: AI-generated quiz JSON is validated against a strict
  schema before rendering (tested with 8 edge cases in `quiz.test.js`).
- **Input validation**: EPIC (voter ID) input validated against Indian format
  regex (`/^[A-Z]{3}\d{7}$/`) before submission.
- **Rate limiting**: Client-side 3-second cooldown on chat messages to protect
  API quota from spam.
- **Chat history cap**: Sliding window of 20 messages prevents unbounded token
  growth in long sessions.
- **External link safety**: All `target="_blank"` links include
  `rel="noopener noreferrer"`.
- **Secret management**: `.env` is git-ignored. `.env.example` documents all
  variables without real keys.
- **Error boundaries**: Each module initializes in its own try-catch so a failure
  in one (e.g. Maps API timeout) does not blank the entire page.

### Production Note

The `VITE_GEMINI_API_KEY` is exposed in the client bundle (inherent to Vite's
`import.meta.env.VITE_*` pattern). For production deployment, proxy Gemini
requests through a server-side handler (Vercel Functions, Cloudflare Workers,
or Google Apps Script).

## Accessibility

- Skip-to-content link with visible focus state
- ARIA landmarks on all sections (`role`, `aria-labelledby`, `aria-label`)
- `aria-live` regions for dynamic content (countdown, chat, quiz)
- Screen-reader-only labels (`.sr-only`) for icon-only buttons
- Custom `:focus-visible` styles for keyboard navigation
- `@media (prefers-reduced-motion: reduce)` disables all animations
- `<noscript>` fallback with direct ECI link for non-JS environments
- Semantic HTML5: `<header>`, `<main>`, `<footer>`, `<nav>`, `<details>/<summary>`
- Single `<h1>` with proper heading hierarchy

## Assumptions

- The fallback dataset was verified on April 21, 2026 from official ECI, SVEEP,
  and PIB sources. It covers the 2026 Assembly election cycle for Assam, Kerala,
  Puducherry, Tamil Nadu, and West Bengal.
- The app does not recommend parties, candidates, ideologies, or campaign
  strategy. It provides neutral process guidance only.
- EPIC (voter ID) format follows the standard Indian pattern: 3 uppercase
  letters followed by 7 digits (e.g., `ABC1234567`).
- The Gemini API key is provided via environment variable and is expected to
  have access to the Gemini API and Google Search grounding.
- Users are expected to have a modern browser (ES2020+). A `<noscript>` fallback
  redirects to the official ECI website for non-JS environments.

## Setup

```bash
npm install
cp .env.example .env
# Add your Gemini API key to .env:
# VITE_GEMINI_API_KEY=your_key_here
npm run dev
```

Optional dynamic data feed:

```bash
VITE_ELECTION_DATA_URL=https://example.com/election-data.json
```

## Testing

```bash
npm test        # 44+ unit tests across 8 suites
npm run build   # Production bundle (~22 kB gzipped)
```

Test coverage spans:
- XSS injection prevention (`dom.test.js`)
- AI output schema validation (`quiz.test.js`)
- Data loading, normalization, and fallback (`data.test.js`)
- Live data merge immutability (`liveData.test.js`)
- Voter readiness decision branches (`readiness.test.js`)
- Countdown formatting (`countdown.test.js`)
- Chat fallback responses (`chat.test.js`)
- Public JSON feed integrity (`public-data.test.js`)

## Project Structure

```text
VoteWise/
  index.html              # SPA shell with CSP, noscript, a11y landmarks
  public/
    election-data.json     # Browser-fetchable election feed
  src/
    config/constants.js    # Environment variables, API endpoints
    data/electionData.js   # Curated fallback election dataset
    main.js                # Entry point with error boundaries
    modules/
      api.js               # Gemini API client (chat + JSON generation)
      chat.js              # Chat UI, rate limiting, history management
      countdown.js         # Real-time election countdown timers
      data.js              # Data loading, normalization, enrichment
      dom.js               # XSS-safe DOM utilities
      liveData.js          # Gemini Search grounding + sessionStorage cache
      quiz.js              # AI quiz generation + schema validation
      readiness.js         # Voter readiness decision engine
      render.js            # Data-driven UI rendering
      simulator.js         # Polling booth simulator + Maps integration
      timeline.js          # Accordion behavior for election journey
    styles/main.css        # Design system with CSS custom properties
  tests/                   # Vitest unit tests (8 suites, 44+ tests)
```
