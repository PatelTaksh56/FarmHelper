# FarmHelper Crop Advisor — Correctable Nutrient Management Logic

## 1. Overview

This document specifies the updated FarmHelper Crop Advisor constraint classification and nutrient management logic.

Under this model, correctable soil nutrient deficiencies (specifically Nitrogen, Phosphorus, and Potassium) do **NOT** make a crop completely ineligible if the crop passes all fundamental agronomic feasibility gates.

---

## 2. Hard Constraints vs. Correctable Management Constraints

### Hard Agronomic Feasibility Gates (Ineligibility Triggers)

The following 5 hard feasibility gates remain non-negotiable and strictly deterministic. If a crop fails any of these gates, it is classified as `NOT_SUITABLE` (`feasibilityPassed = false`):

1. **`PERENNIAL_ORCHARD_EXCLUDED`**: Perennial or orchard crop excluded when evaluating seasonal field rotation.
2. **`NO_DISTRICT_CALENDAR_EVIDENCE`**: Absence of validated district-specific crop calendar evidence.
3. **`OUTSIDE_DISTRICT_SOWING_WINDOW`**: Target post-harvest sowing date falls outside the validated district sowing window.
4. **`SOIL_PH_OUT_OF_BOUNDS`**: Soil pH falls outside the crop's physiological growth range (`phMin`–`phMax`).
5. **`WATER_SOURCE_INCOMPATIBLE`**: Unirrigated/rainfed setup unable to meet high water demand during dry seasons.
6. **`ROTATION_CONFLICT_AVOID_PREVIOUS`**: Immediate succession after a prohibited predecessor crop due to soil-borne disease carryover.

### Correctable Management Constraints (N / P / K Deficiencies)

- **Nitrogen (N)**, **Phosphorus (P)**, and **Potassium (K)** deficiencies are treated as **correctable soil fertility management constraints**.
- Deficiencies smoothly reduce the `soilScore` and overall `suitabilityScore` without causing automatic crop rejection.
- If a crop passes all hard gates but has one or more N/P/K values below the crop's ideal minimum, it is assigned `recommendationStatus = 'SUITABLE_WITH_MANAGEMENT'`.

---

## 3. Recommendation Status Classification Model

Every candidate crop evaluated by the deterministic engine is assigned one of three explicit recommendation statuses:

| Status | Code | Criteria |
| :--- | :--- | :--- |
| ✅ **SUITABLE** | `SUITABLE` | Passes all 5 hard feasibility gates AND all measured N, P, K soil parameters are at or above the crop's ideal minimum requirements. |
| ⚠️ **SUITABLE WITH MANAGEMENT** | `SUITABLE_WITH_MANAGEMENT` | Passes all 5 hard feasibility gates BUT has one or more measured N, P, or K soil parameters below the crop's ideal minimum. |
| ❌ **NOT SUITABLE** | `NOT_SUITABLE` | Fails 1 or more hard agronomic feasibility gates. |

---

## 4. Suitability Scoring & Continuous Decay

- The deterministic engine calculates `suitabilityScore` (0–100) using continuous smooth decay formulas for N, P, and K:
  - `nScore = Math.max(10, Math.round((N / crop.idealN.min) * 90))` when `N < crop.idealN.min`.
- There are no sharp step jumps or artificial rejection boundaries for N/P/K.
- Gemini AI is strictly prohibited from modifying or recalculating `suitabilityScore` or `recommendationStatus`.

---

## 5. Strict Rule Against Inventing Chemical Fertilizer Dosages

To maintain safety and regulatory compliance:
- Neither the deterministic engine nor Gemini AI may generate arbitrary chemical fertilizer dosage statements (e.g. "Apply 125 kg/ha DAP").
- The system communicates deficiencies using structured statements such as:
  > *"Nitrogen below preferred crop range (240 kg/ha vs 280 kg/ha min). Nutrient management should be planned based on soil testing and local KVK advisory guidelines."*

---

## 6. Zero-Candidate & Gemini Boundary

- **Feasible Candidates**: Defined strictly as crops passing all HARD feasibility gates.
- **Zero Candidates**: If 0 crops pass hard constraints, Gemini is **NOT** called. A deterministic rejection breakdown panel is presented to the farmer.
- **Candidates with Deficiencies**: Crops that pass hard constraints but require nutrient management **ARE** eligible candidates (`SUITABLE_WITH_MANAGEMENT`). They enter the top candidate list and Gemini provides structured explanatory reasoning.
