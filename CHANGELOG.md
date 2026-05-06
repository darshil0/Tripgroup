# Changelog

All notable changes to this project will be documented in this file.

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
