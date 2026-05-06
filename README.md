# Tripgroup

> **Group travel, reimagined.** An investor-ready platform that eliminates the chaos of planning holidays with friends — from destination discovery to financial accountability.

---

## Overview

Tripgroup is a comprehensive group holiday booking platform built for modern travelers. It handles every stage of the journey: AI-powered destination discovery, transparent group finances, real-time coordination, and trip administration — all in one place.

---

## Features

### AI-Powered Discovery
Leverage Gemini AI to generate personalized destination recommendations based on your group's budget, travel dates, preferred vibe, and individual preferences.

### Group Wallet
Track contributions, outstanding payments, and overall funding progress with real-time visibility. Every member can see exactly who has paid and how much remains.

### Coordination Hub
A centralized space for real-time group chat and shared document management — boarding passes, vouchers, itineraries, and more — so nothing gets buried in a group thread.

### Trip Administration
Organizers get a dedicated dashboard to manage participants, track bookings, and control trip details from end to end.

### Trip Protection
An integrated insurance upsell section that surfaces relevant trip protection options at the right moment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Motion (Framer Motion) |
| Auth & Database | Firebase Authentication (Google Sign-In), Firebase Firestore |
| AI | Google Gemini API (`@google/genai`) |
| Icons | Lucide React |
| Date Handling | date-fns |

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A Firebase project with Authentication and Firestore enabled

### Environment Variables

Copy `.env.example` to `.env` and populate the values:

```env
GEMINI_API_KEY="your_gemini_api_key"

VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

See `.env.example` for the full list of supported variables.

### Install and Run

```bash
npm install
npm run dev
```

---

## Security

To avoid exposing credentials and triggering secret scanning on GitHub:

1. Never commit your `.env` file — it is listed in `.gitignore` by default.
2. Copy Firebase config values from `firebase-applet-config.json` into your environment variables rather than referencing the file directly in source.
3. If the config file must remain in the repo, replace its values with placeholder strings and load the real values from environment variables at runtime.

---

## License

Licensed under the [Apache-2.0 License](./LICENSE).
