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
- **Gemini AI Integration**: Updated to use the latest stable model (`gemini-2.0-flash`) and corrected the @google/genai SDK implementation.
- **Timestamp Consistency**: Standardized the data layer to use Firestore `serverTimestamp()` as the canonical format, preventing sorting and display inconsistencies.
- **Date Rendering**: Implemented robust date handling utilities to manage both number and Firestore Timestamp formats across the UI.
- **Admin State Management**: Fixed and implemented the "Finalize Bookings" logic for trip administrators.

### Added
- **Join Trip Functionality**: Implemented secure group joining via deep-link URLs (`/join/:tripId`) with capacity constraints and duplicate prevention.
- **Dynamic Group Size**: Added support for custom group sizes (1-50) in trip creation, AI recommendations, and Firestore validation rules.
- **Centralized Error Handling**: Developed a unified error wrapping strategy for service-level errors to provide consistent user feedback.
- **Resilient AI Layer**: Added timeout handling, input sanitization, and graceful fallback for Gemini AI recommendations.

### Improved
- **Firestore Performance**: Refactored data fetching to use server-side `orderBy`, significantly improving efficiency as the data grows.
- **Security Rules**: Hardened Firestore rules with strict range checks and structural validation for all core entities.
- **Metadata**: Updated the application title in `index.html` for better branding and identification.
