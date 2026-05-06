---
title: Skills
version: 1.0.0
---

# SKILLS.MD

## AI-Powered Travel Discovery
- **Trigger**: When asked to generate trip recommendations or destination ideas.
- **Technology**: Google Gemini AI (`gemini-2.0-flash`), `@google/genai` SDK.
- **Goal**: Generate structured, budget-aligned trip suggestions.

### Instructions
1. Use the `getTripRecommendations` service in `src/services/geminiService.ts`.
2. Ensure input parameters (`groupSize`, `budgetPerPerson`, `preferences`) are sanitized using `sanitizeInput`.
3. Set `responseMimeType` to `application/json` and provide a strict `responseSchema`.
4. Implement timeout handling with `AbortController` (default: 15s).
5. Handle errors gracefully by returning an empty array and logging via `console.error`.

---

## Secure Group Coordination
- **Trigger**: When implementing logic for joining trips, making payments, or updating shared state.
- **Technology**: Firebase Firestore, Transactions.
- **Goal**: Maintain data integrity in a multi-user environment.

### Instructions
1. Use Firestore `runTransaction` for critical state changes (e.g., joining a full trip, processing payments).
2. Always check constraints (like `groupSize` limits) inside the transaction.
3. Use `serverTimestamp()` for `createdAt` and `updatedAt` fields to ensure canonical timing.
4. Normalize data using the `normalizeData` utility in `src/lib/firebase.ts` to convert Timestamps to numbers for UI consumption.
5. Use `handleAppError` in `src/lib/firebase.ts` for consistent error reporting.

---

## Component Development
- **Trigger**: When creating new UI components or modifying existing ones.
- **Technology**: React 19, Tailwind CSS 4, Framer Motion (`motion/react`).
- **Goal**: Adhere to the "Editorial Atmospheric" design system.

### Instructions
1. Follow the specifications in `DESIGN.MD`.
2. Use Tailwind's `@theme` variables (e.g., `text-brand`, `font-serif`).
3. Leverage utility classes defined in `src/index.css` (e.g., `glass-card`, `editorial-title`, `micro-label`).
4. Apply `motion/react` for entry animations and layout changes.
5. Ensure components are responsive and use the `atmosphere` background where appropriate to maintain visual depth.
6. Use `Lucide React` for all iconography.
