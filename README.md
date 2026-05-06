# Tripgroup

Tripgroup is a comprehensive, investor-ready group holiday booking platform designed to eliminate the chaos of group travel planning. It handles every aspect of the journey—from destination discovery to financial accountability.

## 🚀 Key Features

- **AI-Powered Discovery**: Leverage Gemini AI to get personalized destination recommendations based on your group's budget and preferences.
- **Group Wallet**: Track group payments and financial health with visual progress bars.
- **Coordination Hub**: Real-time group chat and document management (boarding passes, vouchers).
- **Insurance Upsell**: Integrated trip protection options to ensure peace of mind.
- **Administrative Control**: Centralized dashboard for trip admins to manage participants and bookings.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Motion (framer-motion)
- **Backend & Auth**: Firebase Firestore, Firebase Authentication (Google Login)
- **AI Integration**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Getting Started

### Prerequisites

You will need a Gemini API Key to enable AI recommendations.

### Environment Variables

Create a `.env` file (based on `.env.example`):

```env
GEMINI_API_KEY="your_gemini_api_key"
```

## 📜 License

This project is licensed under the Apache-2.0 License.
