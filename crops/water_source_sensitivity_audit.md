# Water Source Sensitivity Audit

## Test Case

- **Farm**: orchid-1 — Transad (State: Gujarat, Location: Transad / Ahmedabad)
- **Current Crop**: Wheat (Kanak)
- **Sowing Date**: 2026-09-22
- **Expected Harvest Date**: 2027-01-20 (Turnaround: +12 days → Next sowing date: 2027-02-01, Sowing Window: 1 Feb 2027 – 22 Feb 2027, Month = 2 = February)
- **Soil Profile**:
  - Nitrogen (N): 240 kg/ha
  - Phosphorus (P): 18 kg/ha
  - Potassium (K): 280 kg/ha
  - pH: 7.2
- **Baseline Water Source**: River

---

## Water Source Data Flow

The complete data pipeline for per-farm Water Source is:

1. **User Selection / Input**:
   - `MyFarm.tsx` collects `waterSource` (dropdown) and `waterSourceOther` (text input if `waterSource === 'Other'`).
2. **Firestore Persistence**:
   - `createFarm()` / `updateFarm()` in `farmService.ts` saves `waterSource` and `waterSourceOther` in Firestore collection `farms/{farmId}`.
   - Standard sources trigger `deleteField()` on `waterSourceOther` to prevent stale custom strings or `undefined` payload errors.
3. **Model Representation**:
   - Loaded into `Farm` interface in `src/types/models.ts` with typed `WaterSource` union.
4. **Selected Farm Context**:
   - In `CropAdvisor.tsx`, farmer selects farm from dropdown, setting state `selectedFarm`.
5. **Client Service Payload**:
   - `runCropAdvisoryPipeline()` in `cropAdvisorService.ts` passes `waterSource` and `waterSourceOther` into `farmContextInput`.
6. **Deterministic Suitability Engine**:
   - `evaluateCropSuitability()` in `cropSuitabilityEngine.ts` invokes `resolveWaterSourceInfo(farm)` to determine `waterSourceDisplay`, `isSpecified`, and `isIrrigated`.
7. **Numerical Water Scoring (`S_water`)**:
   - `S_water` is computed (0–100) based on crop `waterRequirement` and `isIrrigated` status.
8. **Composite Recommendation Score**:
   - `S_water` is multiplied by 0.10 weight to yield final `suitabilityScore` (0–100%).

`farm.waterSource` **definitely reaches the numerical suitability calculation**.

---

## Water Source Score Sensitivity

Controlled comparison across 5 water sources for the exact same test case:

| Crop | River (Score / S_water) | Rainfed (Score / S_water) | Borewell (Score / S_water) | Canal (Score / S_water) | Drip (Score / S_water) |
|---|---:|---:|---:|---:|---:|
| **Radish** | **93%** (100) | **90%** (70) | **93%** (100) | **93%** (100) | **93%** (100) |
| **Pearl Millet** | **92%** (100) | **92%** (100) | **92%** (100) | **92%** (100) | **92%** (100) |
| **Bitter Gourd** | **91%** (100) | **88%** (70) | **91%** (100) | **91%** (100) | **91%** (100) |

---

## Radish

- **Water Requirement**: Moderate (350–850 mm)
- **Sub-scores**:
  - Soil Score: 85 (pH 7.2 = 100, N 240 = 85, P 18 = 54, K 280 = 85 → 85)
  - Season Score: 100 (Month 2 in sowingMonths [2, 3, 9, 10, 11])
  - Weather Score: 100 (22°C within optimal range 15–22°C)
  - Rotation Score: 80 (wheat is neutral predecessor)
  - Regional Score: 100 (Gujarat listed in suitableStates)
  - Water Score (`S_water`): 100 for River/Borewell/Canal/Drip; 70 for Rainfed
- **Sensitivity Result**:
  - Changing from Rainfed (70) to Irrigated (100) increases score from **90% → 93%**.
  - Changing between River, Borewell, Canal, Drip yields identical **93%** score.

---

## Pearl Millet

- **Water Requirement**: Low (250–900 mm)
- **Sub-scores**:
  - Soil Score: 90 (pH 7.2 = 100, N 240 = 85, P 18 = 81, K 280 = 85 → 90)
  - Season Score: 100 (Month 2 in Gujarat state calendar [1, 2, 3, 6, 7])
  - Weather Score: 80 (22°C in range 20–42°C)
  - Rotation Score: 80 (wheat is neutral predecessor)
  - Regional Score: 100 (Gujarat listed in suitableStates)
  - Water Score (`S_water`): 100 for ALL sources (Low water requirement crops receive 100 under both Rainfed and Irrigated setups)
- **Sensitivity Result**:
  - Score remains **92%** across ALL water sources (Rainfed, River, Borewell, Canal, Drip).

---

## Bitter Gourd

- **Water Requirement**: Moderate (500–1200 mm)
- **Sub-scores**:
  - Soil Score: 85 (pH 7.2 = 100, N 240 = 85, P 18 = 54, K 280 = 85 → 85)
  - Season Score: 100 (Month 2 in sowingMonths [2, 3, 6, 7])
  - Weather Score: 80 (22°C in range 20–36°C)
  - Rotation Score: 100 (Wheat is explicitly listed in `goodPreviousCrops`)
  - Regional Score: 75 (Gujarat not listed in suitableStates)
  - Water Score (`S_water`): 100 for River/Borewell/Canal/Drip; 70 for Rainfed
- **Sensitivity Result**:
  - Changing from Rainfed (70) to Irrigated (100) increases score from **88% → 91%**.
  - Changing between River, Borewell, Canal, Drip yields identical **91%** score.

---

## Water Requirement Model

- **Classification**: Crops are categorized into `Low`, `Moderate`, `High`, `Very High`.
- **Water Source Collapsing**: The engine collapses 8 user options into binary `isIrrigated = true` vs `Rainfed` (`isIrrigated = false`).
- **Effect on Scores**:
  - For `Moderate` crops (Radish, Bitter Gourd): `S_water` = 100 (Irrigated) vs 70 (Rainfed).
  - For `Low` crops (Pearl Millet): `S_water` = 100 (Irrigated) vs 100 (Rainfed).
  - For `High` / `Very High` crops (Rice): `S_water` = 95/100 (Irrigated) vs 40 (Rainfed).

---

## Water Source vs Water Availability

- **Conflation Identified**: The current system conflates physical **Water Source** (`River`, `Canal`, `Borewell`, `Well`, `Farm Pond`) with **Irrigation Reliability / Water Availability**.
- **Agronomic Reality**:
  - A seasonal **River** or **Canal** may dry up in summer (Zaid season), while a deep **Borewell** or **Drip Irrigation** system provides continuous water.
  - A **Farm Pond** depends entirely on monsoonal capture and depletions.
- Currently, the scoring engine treats `River` identically to `Borewell` and `Canal`.

---

## Phosphorus Audit

- **Soil Input**: P = 18 kg/ha.
- **Crop Ideal Ranges**:
  - Radish: 30–60 kg/ha (18 kg/ha is **Deficient**, ratio = 0.60)
  - Pearl Millet: 20–50 kg/ha (18 kg/ha is **Deficient**, ratio = 0.90)
  - Bitter Gourd: 30–60 kg/ha (18 kg/ha is **Deficient**, ratio = 0.60)
- **Flawed Code**:
  In `cropSuitabilityEngine.ts` line 239:
  ```ts
  if (ratio < 0.6) {
    deficiencyNotes.push(`Phosphorus deficient...`);
  }
  ```
  Because ratio (0.60) is NOT strictly `< 0.6`, `deficiencyNotes` remains empty!
  This triggers the fallback text:
  > **"N-P-K matrix aligns with crop demand."**
- **Verdict**: **Technically Inaccurate**. Claiming the NPK matrix aligns with demand when soil P is deficient (18 vs 30 min) is misleading to farmers.

---

## Pearl Millet Calendar Audit

- **Question**: Why is Pearl Millet recommended for February sowing (`1 Feb 2027 – 22 Feb 2027`)?
- **Generic Catalog**: `cropKnowledge.ts` lists `sowingMonths: [6, 7]` (Kharif only).
- **Validated Regional Calendar**: `cropCalendarData.ts` lists:
  `"gujarat|pearl millet": [1, 2, 3, 6, 7]`
- **Agronomic Validation**: In Gujarat, Summer Pearl Millet (Summer/Zaid Bajra) is widely grown under irrigation during Feb–March.
- **Verdict**: The recommendation is **fully supported by `crops/Crop_Calendar_Validated.csv`**. The engine correctly prioritizes the regional state calendar over generic national rules.

---

## Meaning of Suitability Percentage

- **Definition**: The percentage (e.g. `93%`) is a **deterministic, weighted agronomic suitability match index** evaluated on a 0–100 scale across 6 weighted parameters:
  1. Soil pH & NPK Matrix (35%)
  2. Season & Sowing Window Timing (25%)
  3. Thermal / Climate Fit (15%)
  4. Water Source Alignment (10%)
  5. Crop Rotation Benefit (10%)
  6. Regional Agro-Climatic Zone (5%)
- **What it is NOT**:
  - NOT a statistical probability of success or failure.
  - NOT a historical yield prediction or success probability.
  - NOT a machine learning confidence score.

---

## Problems Found

### P0 (Correctness Problems)
- **None**. (No execution or type crashes present).

### P1 (Important Scoring Problems)
- **P1-1: Binary Water Source Collapsing**: All 6 surface/groundwater irrigation sources (`River`, `Canal`, `Borewell`, `Well`, `Farm Pond`, `Other`) yield identical `S_water` scores. River reliability in dry seasons is not differentiated from Borewell/Drip.
- **P1-2: Low Water Requirement Masking**: Crops with `Low` water requirement (e.g. Pearl Millet) receive `S_water = 100` under `Rainfed` conditions even in dry non-monsoon months.

### P2 (Explanation / UI Problems)
- **P2-1: Inaccurate Phosphorus Assessment**: When soil P is below minimum (e.g. 18 kg/ha vs 30 kg/ha min), if ratio = 0.60, `deficiencyNotes` is omitted and the UI falsely claims `"N-P-K matrix aligns with crop demand."`

### P3 (Future Enhancements)
- **P3-1: Irrigation Method vs Water Source Distinction**: Separate physical water source (`Borewell`, `Canal`, `River`) from delivery method (`Drip`, `Sprinkler`, `Flood`) and seasonal reliability index.

---

## Recommended Next Changes

1. **Fix Phosphorus Deficiency Threshold** (P2-1):
   Change `if (ratio < 0.6)` to `if (P < crop.idealP.min)` in `cropSuitabilityEngine.ts` so P deficiency is explicitly reported in `soilAssessment` and prevents false alignment claims.
2. **Refine Water Source Scoring** (P1-1):
   Differentiate perennial groundwater (`Borewell`, `Drip`) from surface/rainfed-dependent water sources (`River`, `Farm Pond`, `Canal`) in seasonal water scoring.
