# SahayakAI — सहायक

Offline-first AI assistant for rural Bharat. Built for Bharat Academix CodeQuest Hackathon 2026.

> No internet? No problem. AI that works where India actually lives.

## How it works

1. **First connection.** The user opens SahayakAI once with internet. The
   browser downloads the Gemma 2B model (~1.5GB, quantized) via
   [WebLLM](https://github.com/mlc-ai/web-llm) and the service worker caches
   every shard.
2. **Goes offline.** From then on, all inference runs on-device via WebGPU —
   no server round-trip. Voice input, Hindi responses, and conversation
   history all work with zero data.
3. **Back online.** SahayakAI silently switches to
   [Groq](https://groq.com)-powered cloud inference (Llama 3.1 8B) for
   faster, higher-quality answers, then drops back to on-device the moment
   the connection disappears.

The three persona tabs (किसान / आशा कार्यकर्ता / शिक्षक) each carry a
tailored system prompt — crop diagnosis and mandi prices for farmers, triage
and dosage lookups with a mandatory escalation note for ASHA workers, lesson
planning with local examples for teachers.

## Stack

| Layer | Choice |
|---|---|
| Shell | Next.js 14 (App Router), installable PWA |
| On-device inference | WebLLM + Gemma 2B, WebGPU |
| Cloud upgrade | Groq API (free tier), Next.js API route |
| Storage | IndexedDB via `idb-keyval` (chat history), Cache Storage (model shards) |
| Voice | Web Speech API |
| Styling | Tailwind CSS |

## Getting started

```bash
npm install
cp .env.example .env.local
# Add a free Groq key to .env.local — only needed for the online upgrade.
# Offline mode works with zero keys.
npm run dev
```

Open `http://localhost:3000` in **Chrome or Edge** (WebGPU support is
required for offline mode; Safari/Firefox can still use online mode).

### First run

On the first load with internet, the app pre-warms the on-device engine in
the background — this is the ~1.5GB download from the deck. Watch the
network tab or DevTools Application > Cache Storage to confirm
`webllm-model-cache` populates. After that, switch DevTools to "Offline" (or
turn off Wi-Fi) and the chat keeps working.

### Before deploying

- **Verify the WebLLM model id.** `src/lib/webllm.ts` pins
  `gemma-2b-it-q4f16_1-MLC`. WebLLM's supported model list changes as new
  quantized builds ship — check
  [`web-llm`'s config](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)
  before shipping and update the constant if the id has moved.
- **Replace the placeholder icons** in `public/icons/` with real artwork —
  the current ones are simple on-brand placeholders generated for this repo.
- **Get a Groq key** at <https://console.groq.com/keys> (free tier) and set
  `GROQ_API_KEY` in your deploy environment.
- Cross-Origin-Isolation headers (`COEP`/`COOP`) are set in
  `next.config.js` — required for WebGPU's threaded WASM backend. If you
  embed SahayakAI in an iframe elsewhere, this will need adjusting.

### Deploying (Vercel — matches the deck's ₹0 infra cost)

```bash
npm i -g vercel
vercel
```

Add `GROQ_API_KEY` under the project's Environment Variables in the Vercel
dashboard. Vercel's free tier + Groq's free tier == the deck's "₹0
infrastructure cost" claim.

## Project structure

```
src/
  app/
    page.tsx           # main screen: persona dock + connectivity dial + chat
    layout.tsx
    api/chat/route.ts   # online-mode completion (Groq)
    api/ping/route.ts   # real reachability check, not just navigator.onLine
  components/
    PersonaDock.tsx
    ConnectivityDial.tsx
    ChatInterface.tsx
    VoiceInputButton.tsx
    MessageBubble.tsx
  lib/
    personas.ts         # the 3 persona system prompts + example questions
    webllm.ts            # on-device engine loader + offline completion
    groq.ts               # server-side Groq client
    db.ts                   # IndexedDB chat history
    useConnectivity.ts       # real online/offline detection hook
```

## Known limitations / next steps (see deck Phase 3)

- IndicTrans2 regional language support (beyond Hindi) is not yet wired in —
  the deck's Phase 3 roadmap item.
- Offline mode currently has no UI for resuming an interrupted model
  download; large downloads on a flaky connection should be resumable.
- No automated tests yet — given the WebGPU dependency, end-to-end testing
  needs a real browser (Playwright with `--enable-unsafe-webgpu`), not jsdom.
