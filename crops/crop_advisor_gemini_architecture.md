# FarmHelper Crop Advisor — Gemini AI + Data-Driven Agronomic Reasoning Architecture

**Date:** 2026-09-28  
**Component:** FarmHelper Crop Advisor (`src/services/cropSuitabilityEngine.ts`, `src/services/cropAdvisorService.ts`, `src/services/geminiCropAdvisorService.ts`, `src/services/farmAgronomicContext.ts`, `functions/index.js`)

> **Core Principle**: FarmHelper compiles and normalizes factual agricultural context (`FarmAgronomicContext`). Gemini receives the complete structured context to perform data-driven agronomic reasoning across soil, crop requirements, historical weather, future weather, location, district crop calendar evidence, regional crop history, water, and crop rotation. Absence of an exact district calendar row (`NO_EVIDENCE` / missing district data) does NOT automatically disqualify a crop into `NOT_SUITABLE`. Hard rejections are reserved strictly for genuine biological/agronomic incompatibilities.

---

## 1. System Architecture & Data Flow

```text
                                  FARM INPUT & TELEMETRY
                                             │
                                             ▼
                              DATA AGGREGATION & NORMALIZATION
                           (cropCalendarData, historicalCropSummary, weather)
                                             │
                                             ▼
                                DETERMINISTIC AGRONOMIC CHECKS
                         (pH bounds, water compatibility, rotation, perennial)
                                             │
                                             ▼
                                STRUCTURED FARM AGRONOMIC CONTEXT
                                   (FarmAgronomicContext object)
                                             │
                                             ▼
                                FIREBASE CLOUD FUNCTION (/adviseCrop)
                                   (Server-side GEMINI_API_KEY)
                                             │
                                             ▼
                                 GEMINI AGRONOMIC REASONING
                          (Evaluates 5 evidence levels & trade-offs)
                                             │
                                             ▼
                                   FINAL CROP ADVISORY UI
                 (Validated Recommendations & AI Agronomic Exploration)
```

---

## 2. Core Components & Responsibilities

### A. Factual Data Preparation (`src/services/farmAgronomicContext.ts`)
- Compiles the authoritative `FarmAgronomicContext` object passed to Gemini.
- Preserves `null` for missing parameters (never assumes zero).
- Includes farm location, soil profile, water availability, crop rotation, historical weather baseline, 16-day forecast, crop requirements, district calendar evidence, and regional production history.

### B. Deterministic Agronomic Engine (`src/services/cropSuitabilityEngine.ts`)
- **Hard Constraints Only**: Rejects crops strictly for:
  1. `PERENNIAL_ORCHARD_EXCLUDED` (perennial crop when orchard crops excluded from rotation)
  2. `OUTSIDE_DISTRICT_SOWING_WINDOW` (validated calendar record exists, but target date falls outside window)
  3. `SOIL_PH_OUT_OF_BOUNDS` (soil pH strictly outside biological growth bounds `phMin`–`phMax`)
  4. `WATER_SOURCE_INCOMPATIBLE` (high water requirement under rainfed setup in dry season)
  5. `ROTATION_CONFLICT_AVOID_PREVIOUS` (prohibited predecessor crop succession conflict)
- **No Hard Rejection for Missing District Rows**: Missing district calendar rows represent `NO_EVIDENCE` / `EVIDENCE_UNKNOWN`, not `NOT_SUITABLE`.
- **Correctable Deficiencies**: N/P/K below ideal minimum yields `SUITABLE_WITH_MANAGEMENT`.

### C. Gemini Agronomic Reasoning Layer (`functions/index.js`)
- Receives structured `FarmAgronomicContext`.
- Reasons across multi-dimensional agricultural factors.
- Evaluates candidate crops across 5 evidence levels.
- Assigns qualitative confidence (`HIGH`, `MEDIUM`, `LOW`) with detailed reasoning.
- Does NOT invent missing soil, weather, or calendar data.
- Does NOT invent exact chemical fertilizer dosages (no "Apply 125 kg/ha DAP").

---

## 3. Evidence Hierarchy

1. **`EXACT_DISTRICT`**: Verified ICAR district crop calendar match for exact state + district.
2. **`STATE_LEVEL`**: State-level ICAR crop calendar record (another district in same state).
3. **`REGIONAL`**: Regional agricultural production statistics or state agro-climatic mapping.
4. **`GENERAL_CROP_KNOWLEDGE`**: Agronomically compatible based on soil pH, temp, water, crop requirements in core knowledge base.
5. **`AI_EXPLORATION`**: AI-derived candidate when local district validation is absent.

---

## 4. Zero-Candidate Behavior (`AI Agronomic Exploration`)

When zero crops pass exact district validation:
1. Preserve deterministic audit breakdown.
2. Build full `FarmAgronomicContext`.
3. Send to Gemini to evaluate broader crop universe.
4. Gemini returns candidates clearly labeled `AI_EXPLORATION` and `POTENTIAL_AI_CANDIDATE`.
5. UI displays: `"⚠ No crops were found with sufficient exact district-level validation"` followed by `"🤖 AI Agronomic Exploration"`.

---

## 5. Security & Secret Management

- **API Keys**: Server-side only via `functions/.env`. No `VITE_GEMINI_API_KEY` on client.
- **Auth Token**: Client passes authenticated Firebase Auth ID token (`Authorization: Bearer <idToken>`).
- **Cloud Function**: Express/HTTPS handler validates token using Firebase Admin SDK.
