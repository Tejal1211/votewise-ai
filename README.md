# VoteWise AI 🗳️
### *Intelligent Election Education Platform — Built with Google Gemini AI & Firebase*

VoteWise AI is a smart, dynamic election education assistant designed to solve the civic knowledge gap for over 900 million Indian voters. By leveraging the Google ecosystem and real-time monitoring, it provides personalized, multilingual guidance to make the democratic process accessible to everyone.

---

## 🎯 Chosen Vertical: Election Process Education
VoteWise AI addresses the critical issues of voter registration confusion, document verification myths, and polling station accessibility.

## 🧠 Approach & Logic
Our approach focuses on **Contextual Intelligence**. The system doesn't just provide static info; it adapts:
*   **Age Logic**: Recommends "Form 6" for new youth voters and "Postal Ballots" for seniors (60+).
*   **Location Logic**: Uses Google Maps to find the nearest booth and calculates state-specific dates.
*   **Role Logic**: Differentiates between First-time voters (registration-focused) and Returning voters (verification-focused).

## 🚀 How it Works
1.  **Onboarding**: User provides minimal context (Age, Language, Location).
2.  **AI Orchestration**: Gemini AI is fed this context to provide hyper-personalized voting advice.
3.  **Real-Time Monitoring**: Firestore listeners update the dashboard instantly when registration status or booth wait times change.

## 📝 Assumptions Made
*   **Connectivity**: Assumes the user has a stable internet connection for real-time Gemini AI and Maps data.
*   **Language**: Assumes most voters in the target demographic are comfortable with English, Hindi, or Marathi (extensible to other languages).
*   **Data Accuracy**: Assumes the user provides accurate age and residency information for eligibility verification.

## ✨ Core Features
*   🤖 **Gemini AI Assistant**: Persistent, context-aware chatbot citing official sources (ECI/NVSP).
*   ✅ **Smart Eligibility Checker**: Multi-factor logic verifying voting rights.
*   📍 **Polling Booth Finder**: Integrated **Google Maps** with live crowd levels and navigation.
*   📋 **Voting Wizard**: Context-tailored 4-step voter journey.

## 🛠️ Google Services Integration
*   **Google Gemini API**: Powers the "Smart Assistant" with system instructions.
*   **Firebase**: Authentication (Google OAuth) and Firestore (Real-time monitoring & History).
*   **Google Maps API**: Interactive booth visualization and Geolocation.
*   **Cloud Run**: High-performance backend hosting for AI requests.

## 🛡️ Evaluation Focus Areas
*   **Code Quality**: Strict separation of concerns (React + Node.js).
*   **Security**: Helmet.js, Rate Limiting, and Environment Variable secret management.
*   **Efficiency**: **Total Repository Size < 200 KB**. 
*   **Accessibility**: WCAG 2.1 AA compliant design.
Deployment link: https://techfest-2026-689374212994.us-central1.run.app
---
*Created for the Google Antigravity Code Challenge.*
