# VoteWise — Build Prompt for Google Antigravity
### Challenge 2 | Prompt Wars Hackathon | April 2026

---

## 🎯 WHAT YOU ARE BUILDING

Build a **single-page web application** called **VoteWise** — an interactive assistant that helps Indian citizens understand the election process, timelines, and steps in an easy-to-follow way.

The app must feel like a **guided civic companion**, not a static info page. It should be contextually live — India has active assembly elections happening RIGHT NOW in April 2026 (Tamil Nadu votes April 23, West Bengal votes April 23 & 29, results May 4).

---

## 🛠️ TECH STACK

- **Frontend**: Single HTML file with vanilla JS + CSS (no frameworks needed)
- **AI**: Gemini API (`gemini-2.0-flash` or `gemini-1.5-flash`) for the chatbot and quiz
- **Fonts**: Google Fonts — `Noto Sans` (covers all Indian scripts)
- **Icons**: Google Material Icons (via CDN)
- **Translation**: Google Translate API (optional enhancement)
- **Language**: All text in English by default; add a language toggle for Hindi as a stretch goal

---

## 📐 APP STRUCTURE — 5 PANELS

Build the app as a **single scrollable page** with 5 clearly separated sections:

---

### PANEL 1 — LIVE ELECTION PULSE (Hero Banner)

At the very top, show a live context banner:

```
🗳️  INDIA VOTES 2026
Tamil Nadu → April 23  |  West Bengal → April 23 & 29  |  Results → May 4
Assam ✅  Kerala ✅  Puducherry ✅  [Already voted — 85%+ turnout]
```

- Show a **countdown timer** to the next polling date (April 23, 2026)
- Show a **results countdown** to May 4, 2026
- Use red/green status dots for each state (voted vs upcoming)
- This banner must be sticky or prominent — it anchors the app in the present moment

---

### PANEL 2 — THE ELECTION JOURNEY (Interactive 10-Step Timeline)

Build a **vertical clickable timeline** of the full Indian election process. Each step should expand on click to show detailed information.

Implement all 10 steps below exactly as described:

**Step 1 — 📢 Election Announcement**
- ECI formally announces schedule
- Model Code of Conduct (MCC) activates immediately on announcement day
- MCC covers 7 areas: general conduct, meetings, processions, party in power, polling booth, polling day, election manifestos
- In 2026: Announced March 15, 2026 for 5 states + Puducherry

**Step 2 — 📋 Electoral Roll Revision (SIR)**
- Special Intensive Revision (SIR) — new 2026 reform
- Covers 510 million voters across 12 states/UTs
- Purpose: remove deceased/migrated voters, add new 18-year-olds, eliminate duplicates
- Uses Aadhaar-based verification
- ⚠️ Badge: "Controversial — opposition says voters were wrongly removed"
- Check your name: voters.eci.gov.in

**Step 3 — 🪪 Voter Registration**
- Eligibility: Indian citizen, 18+ years on January 1st of qualifying year
- How to register: Fill Form 6 online at voters.eci.gov.in or ECINET
- Documents needed: Proof of age + proof of address
- New 2026 rule: Physical EPIC delivered within 15 days via Speed Post
- e-EPIC: Download PDF voter ID instantly on your phone via ECINET — legally valid everywhere

**Step 4 — 📝 Nomination Filing**
- Candidates file nomination with the Returning Officer (RO) of their constituency
- Must submit Form 26 affidavit — declares assets, liabilities, criminal cases, education
- All candidate affidavits are public — visible on ECINET's Know Your Candidate (KYC) module

**Step 5 — 🔎 Scrutiny of Nominations**
- Returning Officers verify all nomination papers
- Conducted in presence of candidates/agents
- Entire process is video-recorded for transparency
- Invalid nominations rejected here

**Step 6 — ↩️ Withdrawal & Final Candidate List**
- Candidates may withdraw within the notified window
- Final list published in Official Gazette with candidate photos
- In 2026: 1,955 candidates contested in Assam, Kerala & Puducherry alone

**Step 7 — 📣 Election Campaign**
- Parties/candidates campaign, subject to MCC rules
- Expenditure limit for assembly candidates: ₹20–40 lakh (varies by state)
- Candidates must maintain expense records from nomination to result
- Submit expense account within 30 days of result; overspending = disqualification (up to 3 years)
- New 2026 AI Rule: All AI-generated campaign content must be labelled "AI-Generated" / "Synthetic Content"
- Campaign ends 48 hours before polling — the Silence Period (Section 126, RPA 1951)
- During Silence Period: no campaign, no exit polls, no social media posts about the election

**Step 8 — 🗳️ Polling Day**
- Paid holiday guaranteed for all employees by law (Section 135B, RPA 1951)
- How to vote:
  1. Arrive at your assigned polling station (find it on ECINET)
  2. Show Voter ID (or e-EPIC on phone)
  3. Get your finger marked with indelible ink
  4. Press blue button on EVM next to your candidate
  5. Red light glows + beep confirms your vote
  6. VVPAT slip appears for 7 seconds — verify your candidate
  7. Slip auto-drops into sealed box — voting complete
- New 2026: Candidate photos now shown on EVM for the first time
- Violations? Report instantly on cVIGIL app — resolved within 100 minutes

**Step 9 — 🔒 EVM Sealing & Storage**
- After polls close, Presiding Officer seals EVMs
- Countersigned by polling agents of all candidates
- Transported under security to strong rooms
- Strong rooms sealed and guarded until counting day

**Step 10 — 🧮 Counting & Result**
- Counting day = May 4, 2026 (Dry Day in all poll-going states — no liquor sold)
- EVMs unsealed, votes counted constituency by constituency
- If EVM count vs VVPAT count differs → VVPAT count prevails
- Winner = candidate with most votes (First Past the Post system)
- Winning party/alliance with majority forms government → Chief Minister sworn in

**BADGE SYSTEM on Timeline:**
- 🆕 "New in 2026" badge on Steps 2, 7, 8 (SIR, AI rules, EVM photos)
- ⚠️ "Controversial" badge on Step 2 (SIR debate)
- ✅ "Completed" badge on Steps 1–9 for Assam/Kerala/Puducherry

---

### PANEL 3 — VOTER TOOLS (Quick Action Cards)

Show 4 clickable cards in a 2x2 grid:

**Card 1 — Am I Registered?**
- Text: "Check if your name is on the voter list"
- Button: Opens voters.eci.gov.in in new tab
- Icon: person_search

**Card 2 — Download My Voter ID**
- Text: "Get your e-EPIC digital voter ID instantly"
- Button: Opens ecinet.eci.gov.in in new tab
- Icon: download

**Card 3 — Know My Candidate**
- Text: "Check criminal records, assets & education of candidates"
- Button: Opens ECINET KYC module
- Icon: manage_accounts

**Card 4 — Report a Violation**
- Text: "Seen vote-buying, fake ads, MCC violation? Report it"
- Button: Links to cVIGIL download page
- Icon: report_problem
- Sub-text: "96% of complaints resolved within 100 minutes"

---

### PANEL 4 — ASK VOTEBOT (Gemini-Powered Chatbot)

Build a chat interface powered by the Gemini API.

**System prompt to use for the Gemini API call:**

```
You are VoteBot, a friendly and knowledgeable civic assistant helping Indian citizens understand the election process in 2026. You speak clearly, use simple language, and explain things as if to a first-time voter.

CONTEXT — LIVE ELECTIONS (April 2026):
- ECI announced elections on March 15, 2026 for Assam, Kerala, Tamil Nadu, West Bengal, Puducherry
- Assam (126 seats), Kerala/Keralam (140 seats), Puducherry (30 seats) voted on April 9, 2026
- Turnout: Assam 85.70%, Kerala 78.25%, Puducherry 89.87%
- Tamil Nadu (234 seats) votes April 23, 2026
- West Bengal (294 seats) votes April 23 (Phase 1) and April 29 (Phase 2)
- Results for all states: May 4, 2026
- Total: 824 assembly seats
- Chief Election Commissioner: Gyanesh Kumar

KEY 2026 REFORMS:
- ECINET: World's largest electoral platform launched January 2026, 40+ services, 22 languages
- SIR: Special Intensive Revision of electoral rolls — 510 million voters, Aadhaar-based, controversial
- New EVM rule: Candidate photos now shown on EVMs for first time
- AI campaign content must be labelled "AI-Generated" or "Synthetic Content"
- cVIGIL: 3,23,099 complaints filed Mar 15–Apr 19; 96% resolved in 100 minutes
- Delimitation Bill Constitutional Amendment defeated April 17, 2026 — first time Modi government's amendment failed in Lok Sabha
- Voter ID delivery: Now 15 days (fast-track via Speed Post)
- e-EPIC is legally valid everywhere in 2026

ELECTION PROCESS (10 steps):
1. Election Announcement + MCC activation
2. SIR Electoral Roll Revision
3. Voter Registration (Form 6, ECINET, e-EPIC)
4. Nomination Filing (Form 26 affidavit — public)
5. Scrutiny of Nominations (video-recorded)
6. Withdrawal + Final Candidate List
7. Election Campaign (48-hr silence period, ₹20-40L limit, AI labelling rules)
8. Polling Day (EVM + VVPAT, indelible ink, paid holiday by law, candidate photos new)
9. EVM Sealing + Strong Room Storage
10. Counting + Result Declaration (Dry Day; VVPAT prevails over EVM if discrepancy)

KEY FACTS:
- Voting age: 18 years (as of January 1 of qualifying year)
- Candidate age: minimum 25 years
- EVM manufacturers: BEL (Bengaluru) + ECIL (Hyderabad)
- VVPAT slip visible for 7 seconds before auto-drop
- EVM can record max 2,000 votes, max 384 candidates
- Voter portal: voters.eci.gov.in | ECINET: ecinet.eci.gov.in
- Expenditure limit (Assembly): ₹20–40 lakh per candidate
- Overspending penalty: disqualification for up to 3 years (Section 10A, RPA 1951)
- Form 6: new voter registration | Form 8: address change | Form 6A: NRI registration
- NRIs must be physically present in constituency to vote — no remote voting

TOOLS TO MENTION:
- voters.eci.gov.in — check registration, find polling station
- ecinet.eci.gov.in — all-in-one platform, e-EPIC download, KYC
- cVIGIL app — report MCC violations (available on Play Store & App Store)
- Saksham — accessibility services for persons with disabilities

TONE RULES:
- Be friendly, encouraging, and non-partisan
- Never express opinions on political parties or candidates
- If asked about controversial topics (SIR, EVM tampering, Delimitation), present both sides fairly
- Keep answers concise — 3–5 sentences unless more detail is asked for
- End answers about registration/voting with a direct link or action step
- If asked in Hindi or regional languages, respond in the same language

EXAMPLE Q&A:
Q: Am I eligible to vote?
A: You are eligible if you are an Indian citizen, 18 years or older as of January 1, 2026, and your name is on the electoral roll. You can check at voters.eci.gov.in in under 30 seconds.

Q: What is VVPAT?
A: VVPAT stands for Voter Verified Paper Audit Trail. After you press the button on the EVM, a paper slip appears for 7 seconds showing the candidate and symbol you voted for. It then drops into a sealed box. This lets you confirm your vote was recorded correctly.

Q: What is the Delimitation Bill?
A: Delimitation means redrawing constituency boundaries to reflect population changes. The government introduced a Delimitation Bill in 2026 to increase Lok Sabha seats from 543 to 850 and reserve 33% for women. However, the Constitutional Amendment Bill needed to pass it was defeated in the Lok Sabha on April 17, 2026 — the first time a constitutional amendment by the current government failed in Parliament. The government then withdrew the Delimitation Bill.
```

**Chat UI Requirements:**
- Clean chat bubble interface (user = right/blue, VoteBot = left/grey)
- Show "VoteBot is thinking..." loading indicator while API call is in progress
- Suggested starter questions shown as chips below the input box:
  - "How do I register to vote?"
  - "What is an EVM?"
  - "What is the MCC?"
  - "When are Tamil Nadu elections?"
  - "What is SIR?"
  - "How does VVPAT work?"
- Input field with send button at bottom
- Chat history maintained in the session (pass full history to Gemini each call)

---

### PANEL 5 — ELECTION QUIZ (Gemini-Generated)

Build a 5-question multiple choice quiz about the Indian election process.

**How it works:**
1. User clicks "Start Quiz"
2. Make ONE Gemini API call requesting 5 questions in JSON format
3. Display questions one at a time with 4 options each
4. Show correct/wrong feedback after each answer
5. Final score screen with message based on score

**Gemini prompt for quiz generation:**

```
Generate exactly 5 multiple choice questions about the Indian election process, focusing on 2026 updates. Each question must have 4 options with exactly one correct answer.

Return ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer."
    }
  ]
}

Topics to cover: EVM/VVPAT, voter registration, Model Code of Conduct, ECINET, election timeline steps, 2026 specific reforms (SIR, AI labelling, candidate photos on EVMs, fast-track EPIC delivery).
Make questions a mix of easy and medium difficulty. Do not repeat questions across sessions — vary them.
```

**Score messages:**
- 5/5 → "🏆 Democracy Champion! You're ready to vote and inform others."
- 3–4/5 → "🎖️ Well done! You know your rights — keep learning."
- 1–2/5 → "📚 Good start! Explore the Election Journey above to learn more."
- 0/5 → "👋 No worries! Start with Step 1 of the Election Journey."

---

## 🎨 DESIGN REQUIREMENTS

### Color Palette (Indian tricolor-inspired)
```css
--primary: #FF9933;      /* Saffron — CTA buttons, active states */
--secondary: #138808;    /* Green — success, confirmed steps */
--accent: #000080;       /* Navy blue — headings, key text */
--white: #FFFFFF;
--light-bg: #F8F9FA;     /* Panel backgrounds */
--border: #E0E0E0;
--text: #1A1A1A;
--text-muted: #666666;
--live-red: #D32F2F;     /* Live pulse indicator */
```

### Typography
```css
font-family: 'Noto Sans', sans-serif;  /* Covers all Indian scripts */
/* Import: https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap */
```

### Layout
- Max width: 900px, centered
- Mobile-first: fully responsive
- Section padding: 48px top/bottom
- Card border-radius: 12px
- Subtle box shadows on cards

### Key UI Components
- **Timeline**: Vertical line with numbered circles; click to expand
- **Status dots**: Pulsing red dot for "live/upcoming", green for "voted"
- **Badge chips**: Small coloured chips for "🆕 New in 2026", "⚠️ Controversial", "✅ Done"
- **Chat**: WhatsApp-style bubbles
- **Quiz**: Card-based with animated correct/wrong feedback

---

## 📁 FILE STRUCTURE

Deliver as a **single file**: `index.html`

All CSS goes in a `<style>` tag in the `<head>`.
All JavaScript goes in a `<script>` tag before `</body>`.
No external JS frameworks. No separate files.

---

## 🔑 GEMINI API INTEGRATION

```javascript
// Call pattern for VoteBot
async function askVoteBot(userMessage, chatHistory) {
  const messages = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  messages.push({ role: "user", parts: [{ text: userMessage }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: VOTEBOT_SYSTEM_PROMPT }] },
        contents: messages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
      })
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Call pattern for Quiz
async function generateQuiz() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: QUIZ_PROMPT }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
      })
    }
  );
  const data = await response.json();
  const raw = data.candidates[0].content.parts[0].text;
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
```

Place `const GEMINI_API_KEY = "YOUR_API_KEY_HERE";` at the top of the script. Antigravity will inject or manage the key.

---

## 📋 README CONTENT (for GitHub submission)

```markdown
# VoteWise — Indian Election Assistant

## Chosen Vertical
Civic Education / Election Process Guide (Challenge 2)

## What It Does
VoteWise is an interactive single-page web app that helps Indian citizens understand
the 2026 assembly election process — from voter registration to result declaration —
through a live timeline, AI chatbot, voter tools, and quiz.

## Approach & Logic
- Live-first: Anchored in the April 2026 elections currently happening in 5 states
- 10-step election journey with expandable detail and 2026-specific reform badges
- Gemini-powered VoteBot answers election questions with full 2026 context
- Quick-access voter tools deep-linking to official ECI/ECINET services
- Gemini-generated quiz to reinforce learning

## How It Works
1. User sees live election status on load
2. Explores the 10-step timeline at their own pace
3. Uses Voter Tools to check registration, download e-EPIC, or report violations
4. Asks VoteBot any election question in plain language
5. Tests knowledge with the AI-generated quiz

## Google Services Used
- Gemini API (gemini-2.0-flash) — VoteBot chatbot + quiz generation
- Google Fonts (Noto Sans) — multilingual typography
- Google Material Icons — UI iconography

## Assumptions
- User has basic internet access and a modern browser
- API key is provided at runtime via Antigravity environment
- Election dates are hardcoded for the 2026 cycle (Assam/Kerala/Puducherry: Apr 9 ✅,
  Tamil Nadu: Apr 23, West Bengal: Apr 23 & 29, Results: May 4)
```

---

## ✅ QUALITY CHECKLIST BEFORE SUBMITTING

- [ ] All 5 panels render correctly on mobile and desktop
- [ ] Countdown timer updates every second
- [ ] Timeline steps expand/collapse on click
- [ ] All 10 steps have complete content
- [ ] "New in 2026" badges visible on Steps 2, 7, 8
- [ ] All 4 voter tool cards link to correct URLs
- [ ] VoteBot sends messages and receives Gemini responses
- [ ] Chat history is passed correctly on each API call
- [ ] Suggested question chips populate the chat input
- [ ] Quiz generates 5 questions via Gemini
- [ ] Quiz shows correct/wrong feedback after each answer
- [ ] Final score message appears after Q5
- [ ] No console errors
- [ ] Repo is public, single branch, under 1 MB
- [ ] README included and complete

---

*Built for Prompt Wars 2026 — Challenge 2: Election Process Assistant*
*Data sourced from ECI press releases, PIB, Britannica, and live April 2026 news*
