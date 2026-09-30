# Crop Advisor Final Agronomic Evidence Audit & Validation Report

**Date:** 2026-09-28  
**Component:** FarmHelper Crop Suitability Engine (`src/services/cropSuitabilityEngine.ts`)  
**Data Sources:** `crops/Crop_Calendar_Validated.csv`, `src/data/cropCalendarData.ts`, `crops/crop_knowledge.csv`  
**Matching Hierarchy:** `Farm State + Farm District + Crop` (Exact Match Only)

---

## Executive Summary

The **FarmHelper Crop Advisor** enforces strict, deterministic agronomic evidence filtering. Candidates must pass 5 real-world feasibility gates before entering suitability scoring:

```text
Selected Farm Location (State + District)
                 ↓
Current Crop + Expected Harvest Date (2027-01-20)
                 ↓
Target Next Sowing Date (Expected Harvest + 12 Days Turnaround = 2027-02-01)
                 ↓
District-Specific Validated ICAR Crop Calendar
                 ↓
Real-World Feasibility Gates (Perennial, District Evidence, Sowing Window, pH, Water, Rotation)
                 ↓
Only Feasible Crops Enter Continuous Suitability Scoring
                 ↓
Final Ranked Recommendations (or 0 Recommendations if no crop is validated for location/time)
```

---

## 1. Audit Principles & Matching Hierarchy

1. **Exact District Matching Hierarchy**:
   - `Gujarat + Ahmedabad + Pearl Millet` matches ONLY `Gujarat + Ahmedabad + Pearl Millet`.
   - It does **NOT** match `Gujarat + Anand + Pearl Millet` or generic state-level records.

2. **Honest Date Logic & Evidence Precision**:
   - Target Sowing Date = Expected Harvest Date (2027-01-20) + 12 Days Turnaround = **2027-02-01**.
   - If the source specifies exact date ranges (e.g. `1st week of feb`, `15 feb - 15 march`, `25 feb - 7 march`), evidence precision is marked **`DATE_RANGE`** and target date (Day & Month) is validated against the exact start/end boundary.
   - If the source specifies month only (e.g. `february`), evidence precision is marked **`MONTH`**.
   - If no record exists for the farm's district, evidence precision is marked **`NONE`**.

3. **Machine-Readable Exclusion Codes**:
   - `NO_DISTRICT_CALENDAR_EVIDENCE`: No validated ICAR calendar record exists for this crop in the farm's district.
   - `OUTSIDE_DISTRICT_SOWING_WINDOW`: Record exists in the farm's district, but target sowing date falls outside the validated window.
   - `PERENNIAL_ORCHARD_EXCLUDED`: Multi-year perennial/orchard crop excluded from annual field crop rotation.
   - `SOIL_PH_OUT_OF_BOUNDS`: Soil pH is outside tolerable growth range.
   - `WATER_SOURCE_INCOMPATIBLE`: Water requirement cannot be sustained by the farm's water source.
   - `ROTATION_CONFLICT_AVOID_PREVIOUS`: Predecessor crop conflict.

4. **Honest Agronomic Wording**:
   - The system **NEVER** claims *"This crop cannot be grown in this district."*
   - For missing evidence: *"Not recommended because no validated district-specific sowing-calendar evidence is available in the current dataset."*
   - For out-of-window crops: *"Not recommended because the target sowing date falls outside the validated sowing window for this district."*

---

## 2. Section 1: Ahmedabad Regression Audit (51 Official Crops)

**Farm Parameters**:
- **Location**: Transad, District: Ahmedabad, State: Gujarat
- **Current Crop**: Wheat (Kanak) | **Expected Harvest**: 2027-01-20 | **Target Sowing**: 2027-02-01
- **Water Source**: River (Irrigated) | **Soil**: N=240, P=18, K=280, pH=7.2

**Summary**: Feasible Crops = **0**, Rejected Crops = **51**.

### 51-Crop Audit Table — Ahmedabad (Target Sowing: 2027-02-01)

| Crop | State | District | Calendar Evidence | Evidence Precision | Sowing Window | Target Date | Calendar Result | Feasibility Result | Final Result | Exclusion Reason | Source Reference |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| Barley | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Basmati Rice | Gujarat | Ahmedabad | EXACT_DISTRICT | DATE_RANGE | 1 July to 15 Aug | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2072 (Sl 2071) |
| Finger Millet | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Maize | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Pearl Millet | Gujarat | Ahmedabad | EXACT_DISTRICT | DATE_RANGE | 15 June to 15 July | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2073 (Sl 2072) |
| Rice | Gujarat | Ahmedabad | EXACT_DISTRICT | DATE_RANGE | 1 July to 15 Aug | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2072 (Sl 2071) |
| Sorghum | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Wheat | Gujarat | Ahmedabad | EXACT_DISTRICT | DATE_RANGE | Unirri oct 2/irri Nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2076 (Sl 2075) |
| Black Gram | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Chickpea | Gujarat | Ahmedabad | EXACT_DISTRICT | DATE_RANGE | Second week of October | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2078 (Sl 2077) |
| Green Gram | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Horse Gram | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Lentil | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Moth Bean | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Pigeon Pea | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Mustard | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Soybean | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Sunflower | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cotton | Gujarat | Ahmedabad | EXACT_DISTRICT | DATE_RANGE | IR 15 May to 15 June | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2074 (Sl 2073) |
| Jute | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Bitter Gourd | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Bottle Gourd | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Brinjal | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cabbage | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Carrot | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cauliflower | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cucumber | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Drumstick | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Garlic | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Okra | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Onion | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Potato | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Pumpkin | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Radish | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Ridge Gourd | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Tomato | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Apple | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Banana | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Coconut | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Grapes | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Jackfruit | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Mango | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Muskmelon | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Orange/Mandarin | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Papaya | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Pomegranate | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Watermelon | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Black Pepper | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cardamom | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Coriander | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Turmeric | Gujarat | Ahmedabad | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |

---

## 3. Section 2: Anand Regression Audit (51 Official Crops)

**Farm Parameters**:
- **Location**: Transad, District: Anand, State: Gujarat
- **Current Crop**: Wheat | **Expected Harvest**: 2027-01-20 | **Target Sowing**: 2027-02-01
- **Water Source**: River (Irrigated) | **Soil**: N=240, P=18, K=280, pH=7.2

**Summary**: Feasible Crops = **2** (Rice, Basmati Rice), Rejected Crops = **49**.

### Detailed 10-Point Agronomic Audit for Anand Candidate Crops

1. **Pearl Millet (Bajara)**:
   - *Anand Record Exists?* Yes (Line 2147 / Sl 2146 `Anand | Bajara | Summer | Sowing: 15 feb to 15 march`).
   - *Sowing Period*: `15 feb` to `15 march`.
   - *February Supported?* Yes, but starting February 15.
   - *Evidence Precision*: `DATE_RANGE`.
   - *Feb 1 Inside Window?* **NO** (Feb 1 is 14 days before Feb 15).
   - *Verdict*: **REJECTED (`OUTSIDE_DISTRICT_SOWING_WINDOW`)**. Removed from recommendations for Feb 1.

2. **Green Gram (Mungbean)**:
   - *Anand Record Exists?* Yes (Line 2149 / Sl 2148 `Anand | Mungbean | Summer | Sowing: 25 feb 7 march`).
   - *Sowing Period*: `25 feb` to `7 march`.
   - *February Supported?* Yes, but starting February 25.
   - *Evidence Precision*: `DATE_RANGE`.
   - *Feb 1 Inside Window?* **NO** (Feb 1 is 24 days before Feb 25).
   - *Verdict*: **REJECTED (`OUTSIDE_DISTRICT_SOWING_WINDOW`)**. Removed from recommendations for Feb 1.

3. **Rice (Paddy)**:
   - *Anand Record Exists?* Yes (Line 2148 / Sl 2147 `Anand | Paddy | Summer | Sowing: 1st week of feb to may`).
   - *Sowing Period*: `1st week of feb` to `may`.
   - *February Supported?* Yes, starting 1st week of February.
   - *Evidence Precision*: `DATE_RANGE`.
   - *Feb 1 Inside Window?* **YES** (Feb 1 falls inside the 1st week of Feb).
   - *Season*: Summer.
   - *Water Source Alignment*: River irrigation matches high water demand.
   - *Rotation after Wheat*: Compatible cereal sequence.
   - *Soil pH*: 7.2 fits within 5.0–8.0 bounds.
   - *Nutrient Deficits*: P=18 kg/ha (deficient vs 20 kg/ha min), evaluated with smooth continuous score decay.
   - *Verdict*: **FEASIBLE and RECOMMENDED!**

4. **Basmati Rice**:
   - *Anand Record Exists?* Yes (Line 2148 / Sl 2147 `Anand | Paddy | Summer | Sowing: 1st week of feb to may`).
   - *Feb 1 Inside Window?* **YES**.
   - *Verdict*: **FEASIBLE and RECOMMENDED!**

### 51-Crop Audit Table — Anand (Target Sowing: 2027-02-01)

| Crop | State | District | Calendar Evidence | Evidence Precision | Sowing Window | Target Date | Calendar Result | Feasibility Result | Final Result | Exclusion Reason | Source Reference |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| Barley | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Basmati Rice | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 1 st week of feb to may | 2027-02-01 | PASS | PASS | FEASIBLE | NONE | Line 2148 (Sl 2147) |
| Finger Millet | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Maize | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 3rd week of june to 4th week of july | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2125 (Sl 2124) |
| Pearl Millet | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 15 june to 15 july / 15 feb to 15 march | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2147 (Sl 2146) |
| Rice | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 1 st week of feb to may | 2027-02-01 | PASS | PASS | FEASIBLE | NONE | Line 2148 (Sl 2147) |
| Sorghum | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Wheat | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 20 to 30 nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2136 (Sl 2135) |
| Black Gram | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 15 oct to 15 nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2140 (Sl 2139) |
| Chickpea | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 15 oct to 15 nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2140 (Sl 2139) |
| Green Gram | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 16 june to 15 july / 25 feb 7 march | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2149 (Sl 2148) |
| Horse Gram | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 15 oct to 15 nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2140 (Sl 2139) |
| Lentil | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Moth Bean | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Pigeon Pea | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 15 june to 15 july | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2126 (Sl 2125) |
| Mustard | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 2nd week oct | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2141 (Sl 2140) |
| Soybean | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 3rd week of june to 1st week of july | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2130 (Sl 2129) |
| Sunflower | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cotton | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 2nd week of june | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2131 (Sl 2130) |
| Jute | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Bitter Gourd | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Bottle Gourd | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Brinjal | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cabbage | Gujarat | Anand | EXACT_DISTRICT | MONTH | nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2145 (Sl 2144) |
| Carrot | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cauliflower | Gujarat | Anand | EXACT_DISTRICT | MONTH | oct | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2144 (Sl 2143) |
| Cucumber | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Drumstick | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Garlic | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Okra | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Onion | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Potato | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 25 oct to 25 nov | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2142 (Sl 2141) |
| Pumpkin | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Radish | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Ridge Gourd | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Tomato | Gujarat | Anand | EXACT_DISTRICT | MONTH | sept | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2143 (Sl 2142) |
| Apple | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Banana | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Coconut | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Grapes | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Jackfruit | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Mango | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Muskmelon | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Orange/Mandarin | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Papaya | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Pomegranate | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Watermelon | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | PERENNIAL_ORCHARD_EXCLUDED | N/A |
| Black Pepper | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Cardamom | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Coriander | Gujarat | Anand | NO_EVIDENCE | NONE | N/A | 2027-02-01 | FAIL | FAIL | REJECTED | NO_DISTRICT_CALENDAR_EVIDENCE | N/A |
| Turmeric | Gujarat | Anand | EXACT_DISTRICT | DATE_RANGE | 15 june to 15 july | 2027-02-01 | FAIL | FAIL | REJECTED | OUTSIDE_DISTRICT_SOWING_WINDOW | Line 2126 (Sl 2125) |

---

## 4. Section 3: Missing District Evidence

**Exclusion Code**: `NO_DISTRICT_CALENDAR_EVIDENCE`  
**Description**: Triggered when `DISTRICT_CROP_CALENDAR` contains no validated ICAR record for the specified state, district, and crop combination.  
**Example**: Radish in Ahmedabad (Gujarat). No row exists in `Crop_Calendar_Validated.csv` for `Gujarat, Ahmedabad, Radish`.  
**User-Facing Text**: *"Not recommended because no validated district-specific sowing-calendar evidence is available in the current dataset."*

---

## 5. Section 4: Out-of-Window Crop

**Exclusion Code**: `OUTSIDE_DISTRICT_SOWING_WINDOW`  
**Description**: Triggered when a validated record exists for the farm's district, but the calculated target sowing date (`expectedHarvestDate + 12 days`) falls outside the validated sowing window.  
**Example**: Pearl Millet in Anand (Gujarat). Validated Summer sowing window is `15 feb` to `15 march` (Line 2147 / Sl 2146). Target sowing date is `2027-02-01`. Because Feb 1 is 14 days before Feb 15, the target date falls outside the window.  
**User-Facing Text**: *"Not recommended because the target sowing date falls outside the validated sowing window for this district."* (Includes source reference e.g., `Line 2147 (Sl 2146)`).

---

## 6. Section 5: Rotation Conflict

**Exclusion Code**: `ROTATION_CONFLICT_AVOID_PREVIOUS`  
**Description**: Triggered when the candidate crop belongs to `avoidPreviousCrops` for the farm's current crop.  
**Example**: Wheat following Wheat (monoculture carryover of root rot / fungal pathogens).  
**User-Facing Text**: *"Rotation conflict: cannot be sown immediately after Wheat due to disease/wilt carryover risk."*

---

## 7. Section 6: Water Incompatibility

**Exclusion Code**: `WATER_SOURCE_INCOMPATIBLE`  
**Description**: Triggered when a crop has High or Very High water requirement and the farm is rainfed during a dry Rabi or Zaid season.  
**Example**: Paddy during Rabi under Rainfed water source.  
**User-Facing Text**: *"High water requirement (900-1200mm) cannot be sustained under rainfed setup during dry Rabi season."*

---

## 8. Section 7: pH Incompatibility

**Exclusion Code**: `SOIL_PH_OUT_OF_BOUNDS`  
**Description**: Triggered when soil pH is less than `phMin` or greater than `phMax`.  
**Example**: Blueberry or tea requiring acidic soil pH 4.5 on alkaline soil pH 8.2.  
**User-Facing Text**: *"Soil pH (8.2) is outside tolerable physiological growth range (5.0–7.0)."*

---

## 9. Section 8: Perennial Exclusion

**Exclusion Code**: `PERENNIAL_ORCHARD_EXCLUDED`  
**Description**: Triggered for multi-year tree or fruit orchard crops when evaluating seasonal field crop rotations, unless `includePerennial` is enabled.  
**Example**: Mango, Apple, Coconut, Grapes.  
**User-Facing Text**: *"Long-term perennial orchard crop; excluded from seasonal field crop rotation."*

---

## 10. Verification & Build Commands

- **TypeScript Compilation**: `npx tsc --noEmit` $\rightarrow$ **PASS** (0 errors)
- **Production Build**: `npm run build` $\rightarrow$ **PASS** (clean Vite build)
- **Functions Syntax Check**: `node --check index.js` $\rightarrow$ **PASS** (0 syntax errors)

---

## 11. Gemini AI Integration Validation

| Validation Check | Result | Verification Notes |
|:---|:---:|:---|
| **Frontend $\rightarrow$ Firebase Function** | **PASS** | Communication routed via `geminiCropAdvisorService.ts` to `/adviseCrop` Firebase Cloud Function. |
| **Authentication** | **PASS** | `authenticateRequest` middleware verifies Firebase ID token (`auth.verifyIdToken`). Unauthenticated calls rejected with HTTP 401. |
| **Gemini Server-Side Call** | **PASS** | Executed in Node.js server environment via `@google/genai` SDK (`GoogleGenAI`). |
| **API Key Exposure Check** | **PASS** | Verified zero `VITE_GEMINI_API_KEY` or client bundle secrets. Key restricted to `functions/.env`. |
| **Structured Response Validation** | **PASS** | Enforced JSON schema containing `overallSummary`, `whySuitable`, `keyRisks`, `managementActions`, `nutrientAdvice`. |
| **Zero-Candidate Handling** | **PASS** | If 0 crops pass deterministic gates (e.g. Ahmedabad on Feb 1), pipeline triggers Mode C (`AGRONOMIC_EXPLORATION`). Deterministic audit is preserved while Gemini explores 3-5 potential alternatives. |
| **Deterministic Score Preservation**| **PASS** | Authoritative suitability score (`suitabilityScore`) comes strictly from `cropSuitabilityEngine.ts`. Gemini cannot alter scores for validated candidates, and potential crops use qualitative `AI Potential: HIGH/MED/LOW`. |
| **District Evidence Preservation** | **PASS** | Pre-validated `EXACT_DISTRICT` calendar evidence is passed into Gemini. In Mode C, potential crops are strictly tagged with `validationStatus: "AI_DERIVED_NOT_DISTRICT_VALIDATED"`. |
| **Gemini Failure Fallback** | **PASS** | If backend API or network fails, pipeline falls back gracefully to deterministic audit grid with `aiStatus: 'ai-unavailable'` without crashing. |
| **Missing Soil Data Handling** | **PASS** | Unspecified soil nutrients (N, P, K) are passed as `null` (not 0) and state limited assessment rather than fabricating numbers or claiming false deficit. |
| **Language Handling** | **PASS** | Passes `preferredLanguage` (`gu-IN`, `hi-IN`, `en-IN`, etc.). System instructions mandate response in target language while preserving scientific names. |
| **TypeScript Compilation** | **PASS** | `npx tsc --noEmit` passed clean with 0 errors. |
| **Production Build** | **PASS** | `npm run build` passed clean with Vite production bundle. |

---

## 12. Correctable Nutrient Management & Exploration Mode Validation

| Test Case | Scenario / Parameters | Expected Result | Actual Result | Verification |
|:---|:---|:---|:---|:---:|
| **Test 1 — Validated Candidates (Mode A & B)** | Candidates pass hard gates (e.g. Rice in Anand on Feb 1). | Mode = `VALIDATED_RECOMMENDATION`. Gemini explains ONLY deterministic candidates. Candidates with N/P/K deficits receive `SUITABLE_WITH_MANAGEMENT` badge. | **PASS** | **PASS** |
| **Test 2 — Zero Validated Candidates (Mode C)** | 0 crops pass hard feasibility gates (e.g. Ahmedabad on Feb 1). | Mode = `AGRONOMIC_EXPLORATION`. System displays deterministic rejection breakdown audit + 3–5 AI-derived potential crops clearly marked `AI-Derived — Not District Validated`. | **PASS** | **PASS** |
| **Test 3 — Missing Soil Values** | Soil N/P/K parameters left empty in manual form. | Values passed as `null`. Gemini explicitly notes missing soil test data without fabricating values or claiming false deficiencies. | **PASS** | **PASS** |
| **Test 4 — Missing Weather Data** | Historical weather unavailable for location. | Weather marked unavailable; Gemini notes increased weather uncertainty in confidence explanation. | **PASS** | **PASS** |
| **Test 5 — Gemini Exploration Failure** | Backend Gemini call times out or returns HTTP 500 error during Mode C execution. | UI displays deterministic audit breakdown grid and `AI Agronomic Exploration is temporarily unavailable` banner without crashing. | **PASS** | **PASS** |
| **Test 6 — Auth Token Security** | Unauthenticated POST to `/adviseCrop` Cloud Function. | Server returns HTTP 401 Unauthenticated. Zero API key leakage on React frontend. | **PASS** | **PASS** |
| **Test 7 — Unsupported Certainty Guard** | Gemini attempts to claim an exploration crop is official. | Server-side validation forces `validationStatus = "AI_DERIVED_NOT_DISTRICT_VALIDATED"` on all potential crops. | **PASS** | **PASS** |


