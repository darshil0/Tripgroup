# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] - 2026-05-06

### Hardened & Fixed
- **Security - Zero-Trust Visibility**: Implemented `participantIds` array on Trip documents to enforce zero-trust visibility rules. Firestore rules now strictly limit trip listing and access to authorized participants only.
- **Race Condition - Atomic Membership**: Re-engineered `joinTrip` transaction logic to include an atomic membership pre-check, preventing duplicate participant records and ensuring accurate capacity counts under high concurrency.
- **Performance - Server-Side Message Ordering**: Migrated message sorting from client-side to the Firestore query layer (`orderBy('createdAt', 'asc')`), improving scalability and ensuring correct chronological order on slow networks.
- **Data Integrity**: Updated trip creation and joining paths to maintain the `participantIds` index atomically.

## [1.5.0] - 2026-05-06

### Added
- **Indexing Strategy**: Documented comprehensive Firestore composite index requirements in `docs/FIRESTORE_INDEXES.md` for `trips`, `participants`, and `messages`.
- **Structured Observability**: Implemented transaction-level logging for `joinTrip` operations to track capacity enforcement in real-time.
- **Graceful UI Fallback**: Enhanced Trip Creation flow with descriptive error states and manual entry prompts when AI recommendations are unavailable.

## [1.4.0] - 2026-05-06

### Fixed & Hardened
- **Security**: Migrated Gemini API key to standard Vite environment variables (`VITE_GEMINI_API_KEY`) and removed `define` config exposure.
- **Scalability**: Implemented denormalized `participantCount` on Trip documents to optimize capacity checking and transaction performance.
- **Data Consistency**: Standardized all database creation/updates to use Firestore's `serverTimestamp()` instead of heterogeneous client-side clocks.
- **Robustness**: Enhanced `normalizeData` with recursive deep-normalization support for nested Firestore documents.
- **Resilience**: Added retry logic and improved timeout management for the Gemini recommendation service.
- **Reliability**: Hardened `AuthContext` with error boundaries to prevent hanging loading states during Firestore sync failures.
- **Safety**: Added `isValid` date checks for all UI-rendered mission objectives.
- **Architecture**: Centralized hardcoded application parameters (budget limits, group sizes, insurance pricing) into a managed `constants.ts` file.

## [1.3.0] - 2026-05-06

### Added
- **Mission Checklist**: New task management system for trip objectives with real-time sync.
- **Capacity-Aware Joining**: Robust "Join Initiative" functionality using Firestore transactions to enforce `groupSize` limits.
- **Admin Lock State**: Ability for trip creators to "Finalize Bookings," locking the mission state and preventing new joins.
- **Standardized Data Layer**: Added `normalizeData` utility to cross-convert Firestore Timestamps and epoch numbers.
- **Centralized Error Handling**: Standardized Firestore error shapes for better debugging and UI feedback.
- **Environment Variable Secrets**: Migrated Firebase configuration to environment variables (`VITE_FIREBASE_*`) to prevent secret scanning issues.

### Improved
- **AI Resilience**: Updated Gemini integration with stable `gemini-flash-latest` alias, 15s request timeouts, and input sanitization.
- **Security Hardening**: Enforced strict integer bounds on `groupSize` (1-50) and immutable field protection in Firestore rules.
- **UI Consistency**: Enhanced trip headers with capacity status and synchronized date formatting across views.

## [1.2.0] - 2026-05-06

### Added
- "View Policy Details" link to Insurance Upsell Modal and Banners.
- Editorial-grade UI design system (visible grids, atmosphere backgrounds, micro-labels).
- Toast notification system for success and error states.
- Staggered entrance animations for Dashboard and Chat.
- Lazy initialization for Gemini AI service.

### Fixed
- Fixed duplicate `vite` dependency in `package.json`.
- Fixed message synchronization logic using Firestore `serverTimestamp`.
- Improved typesafety across the application.
- Optimized Firestore queries for message threads.
- Replaced `alert` and `window.location` with modern equivalents.

## [1.1.0] - 2026-05-06

### Added
- **Trip Insurance Upsell**: Integrated a "Protection" flow allowing users to opt for trip insurance during the payment phase.
- **Participant Insurance Staking**: Firestore schema updated to track insurance status per participant.

## [0.9.0] - 2026-05-06

### Added
- **Gemini AI Integration**: Implemented `geminiService` to provide smart destination recommendations during trip creation.
- **Real-time Coordination**: Added trip-specific group chat functionality.
- **Document Management**: UI for sharing and viewing trip documents like boarding passes.

## [0.8.0] - 2026-05-06

### Added
- **Firebase Infrastructure**: Provisioned Firestore and Auth.
- **Core UI**: Implemented Dashboard, Trip Discovery, and detailed Trip view with motion animations.
- **Security Rules**: Deployed hardened Firestore rules following ABAC principles.

## [0.5.0] - 2026-05-06

### Added
- Initial project scaffolding with React, Vite, and Tailwind CSS.
