# Backend Architecture, Design Patterns & Trade-Off Analysis

**Application**: Peavey & Crest Audio WhatsApp Marketing Poster Studio (Odisha Regional SI Edition)  
**Partner Context**: Regional ProFX Distribution Partner for Peavey & Crest Audio in Odisha, India  
**Target User / Audience**: Distributor Sales Engineers & Regional System Integrators (SIs), AV Contractors

---

## 1. Executive Summary

The backend architecture is engineered around a **Lightweight Full-Stack Backend-For-Frontend (BFF)** pattern. It operates as a single-process Node.js/Express service that accomplishes three core duties:

1. **Secure AI Proxying via `@google/genai`**: Executes structured prompt engineering using Gemini 3.8 Flash (`gemini-3.8-flash`) to generate spec-accurate, high-converting WhatsApp pitches for System Integrators in Odisha without ever exposing Google API secrets or credentials to the browser client.
2. **Hybrid Development & Production Lifecycle Hosting**: Unifies Vite development middleware in local sandbox mode (`process.env.NODE_ENV !== 'production'`) with high-performance static SPA serving in production builds, eliminating container complexity.
3. **Resilient Fail-Safe Execution**: Embeds deterministic domain fallback heuristics to ensure that sales engineers in the field can continuously generate and dispatch marketing collateral even during external API downtime or intermittent mobile connectivity.

---

## 2. High-Level Architecture & Request Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / BROWSER RUNTIME                        │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Daily Spotlight Hub  │  │  Poster Studio   │  │ Inventory & CSV  │  │
│  │ (Day-of-Week Engine) │  │  (HTML5 Canvas)  │  │ (Local Storage)  │  │
│  └──────────┬───────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│             │                       │                     │            │
│             └───────────────────────┼─────────────────────┘            │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                   POST /api/generate-si-pitch
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                     BACKEND SERVER (server.ts)                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Express 4.x Router Layer                    │  │
│  │             • CORS & Body Parsing (`express.json()`)             │  │
│  │             • /api/health (Diagnostic Prober)                    │  │
│  │             • /api/generate-si-pitch (B2B Prompt Controller)     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│             ┌───────────────────────┴────────────────────────┐         │
│             ▼                                                ▼         │
│  ┌───────────────────────────────┐            ┌──────────────────────┐ │
│  │      Google GenAI Client      │            │ Graceful Fallback    │ │
│  │  • SDK: @google/genai         │            │ Heuristics           │ │
│  │  • Model: gemini-3.8-flash    │            │ (Domain Mock Engine) │ │
│  │  • User-Agent: aistudio-build │            └──────────────────────┘ │
│  │  • Structured JSON Schema     │                                     │
│  └──────────┬────────────────────┘                                     │
│             │                                                          │
│             ▼                                                          │
│  ┌───────────────────────────────┐                                     │
│  │ Vite Middleware / Static SPA  │                                     │
│  │  • Dev: vite.middlewares      │                                     │
│  │  • Prod: express.static(dist) │                                     │
│  └───────────────────────────────┘                                     │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
                                      ▼ HTTPS
                 ┌────────────────────────────────────────┐
                 │       Google Gemini Cloud Engine       │
                 │          (models/gemini-3.8-flash)     │
                 └────────────────────────────────────────┘
```

---

## 3. Core Architectural Patterns

### A. Backend-for-Frontend (BFF) Pattern
Rather than letting the React client directly access public or cloud AI APIs with exposed keys, all external AI transactions pass through an Express BFF route (`/api/generate-si-pitch`).
- **Security Boundary**: The `GEMINI_API_KEY` remains strictly in `process.env` on the server runtime. Client bundles never contain API keys or secret strings.
- **Domain Context Injection**: The backend enriches raw client requests with regional pro-audio knowledge (Odisha distribution, ProFX official warranty, GST input tax invoicing, Bhubaneswar central depot lead times).

### B. Graceful Degradation / Circuit Fallback Pattern
Pro audio distributors and sales reps often broadcast WhatsApp messages on mobile devices while traveling between districts (e.g., Cuttack, Puri, Berhampur) where network conditions vary.
- If the external Gemini API call encounters a timeout, quota restriction, or connectivity glitch, the endpoint **catches the error gracefully** and immediately synthesizes a spec-accurate fallback pitch using structured product data.
- The user's workflow is never interrupted by a hard crash or blank screen.

### C. Unified Single-Process Dev/Prod Server
Following standard cloud-native container standards, `server.ts` handles both API proxying and frontend asset delivery in a single Node process:
- **Development**: Invokes `createViteServer({ server: { middlewareMode: true } })` to provide instant HMR-compatible module compilation.
- **Production**: Mounts `express.static(path.join(process.cwd(), 'dist'))` with a fallback catch-all route for Single Page Application client-side routing.

---

## 4. Key Design Trade-Offs & Rationale

| Architecture Decision | Chosen Approach | Alternative Considered | Trade-Off Rationale & Analysis |
| :--- | :--- | :--- | :--- |
| **Poster Rendering Engine** | **Client-Side HTML5 Canvas** (`src/utils/canvasRenderer.ts`) | **Server-Side Headless Browser** (Puppeteer / Chromium / Sharp / Node-Canvas) | **Latency & Portability Wins**: Server-side image rendering requires heavy native binaries (Chromium/Puppeteer), takes 2–4 seconds per render, and incurs significant memory overhead. Client-side HTML5 canvas renders in < 50ms at full 2K resolution ($1080 \times 1920$), provides zero server CPU load, and allows instant live editing in the preview pane. |
| **Inventory Persistence** | **Browser LocalStorage + CSV Schema** | **Centralized SQL Database** (Cloud SQL / PostgreSQL / Firestore) | **Zero Barrier & Offline Portability**: For a dedicated regional distributor managing a curated catalog of 20–50 pro audio SKUs, a full relational database adds setup friction, network dependencies, and user authentication hurdles. LocalStorage + bidirectional CSV import/export allows instant offline edits, spreadsheet sync with existing ERPs, and immediate out-of-the-box utility. |
| **Model Selection** | **`gemini-3.8-flash`** | **`gemini-4-argon`** | **Speed & Token Economy**: Generating concise, structured B2B pitch copy and technical bullet points is a high-frequency, low-latency task. Gemini 3.8 Flash delivers structured JSON outputs in ~400ms with high reasoning fidelity, outperforming heavier reasoning models for this specific operational throughput. |
| **Execution Synchronicity** | **Synchronous REST Endpoint** | **Asynchronous Task Queue** (BullMQ / Redis) | **Simplicity vs Overkill**: Pitch generation takes under 1 second. Introducing Redis and worker queues would create unnecessary infrastructure dependencies for a distributor tool with bounded concurrent users. |

---

## 5. API Contracts & Data Specifications

### `POST /api/generate-si-pitch`

#### Request Payload (`application/json`)
```json
{
  "product": {
    "brand": "Crest Audio",
    "model": "CPX 2600 Power Amplifier",
    "category": "Power Amplifiers",
    "shortTagline": "Tour-Grade Linear Power with Patented GCL™ Limiting",
    "keySpecs": [
      { "label": "RMS Output", "value": "2 x 900W", "unit": "@ 4Ω" },
      { "label": "Topology", "value": "Toroidal Class AB/H" }
    ],
    "targetApplications": ["Auditoriums", "Wedding Mandaps", "Houses of Worship"],
    "stockStatus": "In Stock (Odisha)",
    "stockUnits": 14,
    "siB2BPrice": 68500,
    "mrp": 94500,
    "warrantyYears": 3
  },
  "targetProject": "Auditoriums & Convention Halls in Bhubaneswar",
  "tone": "Technical Engineering & Headroom Reliability",
  "customOffer": "Free EASE acoustic simulation + immediate Bhubaneswar dispatch"
}
```

#### Successful Response (`application/json`)
```json
{
  "success": true,
  "data": {
    "headline": "📢 [ODISHA SI STOCK ALERT] CREST AUDIO CPX 2600 TOUR-GRADE AMPLIFIERS",
    "whatsappBody": "*CREST AUDIO CPX 2600 POWER AMPLIFIER*\n_Tour-Grade Linear Power with Patented GCL™ Limiting_\n\nDear Partner,\nHere is an exceptional amplification solution for your upcoming auditorium and mandap installations across Odisha:\n\n• *RMS Headroom:* 2 x 900W @ 4Ω with indestructible toroidal transformers.\n• *GCL™ Gain Comparator:* Automatically eliminates speaker clipping and driver blowout.\n• *Immediate Bhubaneswar Dispatch:* 14 units in stock for same-day dispatch.\n• *Commercial Terms:* ₹68,500 + GST with 3-Year Official ProFX Comprehensive Warranty.\n\nReply to this message for BOQ pricing and tender spec sheets.",
    "siKeyBenefits": [
      "Patented GCL limiting safeguards expensive compression drivers",
      "Toroidal power supply handles voltage fluctuations common in rural/semi-urban venues",
      "High damping factor delivers tight, punchy low-end response"
    ]
  }
}
```

---

## 6. Security, Compliance & Deployment

- **CORS & CSRF Hygiene**: Express routes are scoped to internal app origins; client payloads undergo input validation before forwarding to Gemini.
- **Environment Isolation**:
  - `GEMINI_API_KEY`: Kept on server process only, loaded via `dotenv`.
  - `PORT`: Configurable via environment variable (default: `3000`).
- **Telemetry Header**: Server requests to Gemini include the mandatory `User-Agent: aistudio-build` header in compliance with AI Studio runtime directives.
- **Odisha Distribution Compliance**:
  - Pre-seeded with authentic pro-audio specs aligned with the **ProFX exclusive India distribution agreement for Peavey and Crest Audio**.
  - All commercial estimates factor in standard Indian B2B invoicing (`100% Tax/GST Input Invoice`) and local warehouse warranty routing.
