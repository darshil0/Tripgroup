---
name: Tripgroup AI Workflows
description: Modular AI skills and workflow definitions for group holiday management.
version: 1.0.0
owner: AI Engineering
tags:
  - gemini
  - ai-workflows
  - group-travel
---

# Tripgroup AI Skills

This document outlines the modular workflows and AI skills integrated into Tripgroup.

## 1. Destination Recommendation Engine

- **Model**: `gemini-2.0-flash`
- **Purpose**: Generates tailored group holiday destinations matching budget per person, group size, and location preferences.
- **Service Handler**: `src/services/geminiService.ts` -> `getTripRecommendations`
- **Output Schema**: Structured JSON containing array of `{ destination, description, estimatedCost, activities }`.
- **Resilience**: Built-in timeout controller (15s) and automatic exponential retries with fallback to manual trip creation.

## 2. Zero-Trust Security & Membership Model

- **Pattern**: Zero-Trust trip access filtering using Firestore security rules and `participantIds` array containment queries.
- **Atomic Operations**: Capacity enforcement and membership joins handled via Firestore transactions.

## 3. Financial Tracking & Upsell

- **Purpose**: Real-time tracking of group wallet contributions, split deadlines, and integrated trip insurance add-on calculation.
