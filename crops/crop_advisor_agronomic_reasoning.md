# FarmHelper Crop Advisor — Data-Driven Agronomic Reasoning System

**Date:** 2026-09-28  
**Component:** FarmHelper Crop Advisor Agronomic Reasoning Layer

---

## 1. Executive Summary

The FarmHelper Crop Advisor is a data-driven agronomic reasoning system combining deterministic agricultural validation code with Google Gemini AI. FarmHelper prepares, normalizes, and validates factual agricultural data into a structured `FarmAgronomicContext` object. Gemini acts as an agronomic reasoning layer evaluating soil, crop requirements, historical weather, future weather, location, district crop calendars, historical crop production statistics, water availability, and crop rotation.

---

## 2. Fundamental Philosophy

### "No District Data" != "Not Suitable"
- Missing district crop calendar records represent `EVIDENCE_UNKNOWN` / `NO_EVIDENCE`.
- They do NOT automatically disqualify a crop into `NOT_SUITABLE`.
- Hard rejections are reserved strictly for verified biological or physical incompatibilities (pH out of bounds, incompatible water source under rainfed setup in dry season, perennial orchard crop excluded from seasonal rotation, or disease carryover rotation conflicts).

---

## 3. The 5 Evidence Levels

1. **`EXACT_DISTRICT`**: Verified ICAR district crop calendar match for exact state + district.
2. **`STATE_LEVEL`**: State-level ICAR crop calendar record (another district in same state).
3. **`REGIONAL`**: Regional agricultural production statistics (ICAR-DES data) or state agro-climatic mapping.
4. **`GENERAL_CROP_KNOWLEDGE`**: Agronomically compatible based on soil pH, temp, water, and crop physiological requirements in core knowledge base.
5. **`AI_EXPLORATION`**: AI-derived candidate evaluated when local district validation is absent.

---

## 4. Structured `FarmAgronomicContext` Schema

```json
{
  "farm": {
    "farmId": "...",
    "farmName": "...",
    "state": "Gujarat",
    "district": "Ahmedabad",
    "taluka": null,
    "village": null
  },
  "location": {
    "state": "Gujarat",
    "district": "Ahmedabad",
    "coordinates": { "latitude": null, "longitude": null }
  },
  "currentCrop": {
    "name": "Cotton",
    "sowingDate": "2026-06-15",
    "expectedHarvestDate": "2027-01-20",
    "targetNextPlantingDate": "2027-02-01"
  },
  "soil": {
    "N": 240,
    "P": 18,
    "K": 280,
    "S": null,
    "Zn": null,
    "Fe": null,
    "B": null,
    "pH": 7.2,
    "EC": null,
    "OC": null
  },
  "water": {
    "waterSourceDisplay": "Canal",
    "isIrrigated": true
  },
  "cropRequirements": [...],
  "districtCropCalendar": [...],
  "regionalCropHistory": [...],
  "cropRotation": {...},
  "deterministicAudit": {...}
}
```

---

## 5. Gemini AI Agronomic Reasoning Rules

1. **No Data Fabrication**: Gemini never invents missing soil values, weather telemetry, or calendar dates. Missing values remain `null` or `UNKNOWN`.
2. **No Invented Chemical Fertilizer Dosages**: Gemini does NOT issue rigid chemical dosages (e.g. "Apply 125 kg/ha DAP"). It explains nutrient limitations and recommends soil-test-based management.
3. **No Manufactured Numerical Suitability Scores**: Gemini uses qualitative confidence levels (`HIGH`, `MEDIUM`, `LOW`) with explicit justifications.
4. **Evidence Labeling Integrity**: Gemini clearly distinguishes validated evidence from general agronomic knowledge and AI exploration candidates.

---

## 6. Zero-Candidate Behavior & AI Exploration

If zero candidates pass exact district-level validation:
1. The system preserves the deterministic audit breakdown.
2. The complete `FarmAgronomicContext` is forwarded to Gemini.
3. Gemini evaluates plausible crops across state/regional/general crop knowledge.
4. Candidates are clearly marked `AI_EXPLORATION` and `POTENTIAL_AI_CANDIDATE`.
5. The UI displays an explicit disclaimer:
   `"FarmHelper does not have sufficient district-specific evidence for a validated recommendation. The following crops are potential candidates based on the supplied soil, weather, water, crop requirements, historical evidence and agronomic reasoning."`

---

## 7. Verification & Audit Results

- **`npx tsc --noEmit`**: PASSED (0 errors)
- **`npm run build`**: PASSED (Build completed in 10.36s)
- **`node --check functions/index.js`**: PASSED (0 syntax errors)
- **Backend Port 5001**: Running locally (`task-824`) and responding to `/adviseCrop`.
