# Tripgroup

Tripgroup is a comprehensive, investor-ready group holiday booking platform designed to eliminate the chaos of group travel planning. It handles every aspect of the journey—from destination discovery to financial accountability.

## 🚀 Key Features

- **AI-Powered Discovery**: Leverage Google Gemini API (`gemini-2.0-flash`) to get personalized destination recommendations based on budget and preferences.
- **Group Wallet & Insurance**: Track group payments and financial health with progress bars and integrated trip insurance add-ons.
- **Coordination Hub**: Real-time group chat and document management (boarding passes, vouchers, flight details).
- **Mission Objectives**: Real-time checklist and objective tracking with deadline validation and deletion controls.
- **Administrative Control**: Centralized dashboard for trip admins to manage participants, lock manifests, and trigger booking finalization.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Motion (framer-motion)
- **Backend & Auth**: Firebase Firestore, Firebase Authentication (Google Login)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Testing & Tooling**: Vitest, React Testing Library, ESLint, Prettier, Playwright

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Gemini API Key (or set `VITE_GEMINI_API_KEY`)

### Environment Variables

Create a `.env` file (based on `.env.example`):

```env
VITE_GEMINI_API_KEY="your_gemini_api_key"

# Optional Firebase config overrides (falls back to firebase-applet-config.json)
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="your_database_id"
```

### Developer Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run static type checking and ESLint
npm run lint

# Format codebase with Prettier
npm run format

# Run unit and integration tests with Vitest
npm run test

# Build for production
npm run build
```

## 📐 Design & AI Specifications

- **`DESIGN.MD`**: Contains machine-readable design tokens, palette definitions, and component guidelines. Validated via `npx @google/design.md lint DESIGN.MD`.
- **`SKILLS.MD`**: Outlines AI workflow specifications, model details, and zero-trust security patterns.

## 🔒 Security Model

Tripgroup enforces zero-trust trip visibility:

1. Trip visibility is scoped strictly to participants listed in `participantIds`.
2. Concurrency-safe Firestore transactions prevent overbooking group capacity.
3. Strict input sanitization prevents prompt injection on Gemini requests.

## 📜 License

This project is licensed under the Apache-2.0 License.
