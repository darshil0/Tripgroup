# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2024-05-06

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
