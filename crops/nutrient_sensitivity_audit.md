# N/P/K Nutrient Sensitivity & Boundary Audit Report

**Date:** 2026-09-28  
**Component:** FarmHelper Crop Suitability Engine (`src/services/cropSuitabilityEngine.ts`)  
**Scope:** Deterministic N, P, K nutrient scoring, deficiency detection, score continuity, missing value handling, and key factor explanation text.

---

## Executive Summary

Following the fix to N/P/K deficiency detection (replacing the previous `ratio < 0.6` threshold with exact crop-specific minimum evaluation `value < ideal.min`), a comprehensive mathematical and agronomic boundary audit was conducted. 

The audit evaluated 4 representative crops (**Radish**, **Pearl Millet**, **Bitter Gourd**, and **Maize**) across 7 nutrient levels ($100\%$, $97\%$, $90\%$, $75\%$, $60\%$, $50\%$, and $25\%$ of crop minimum) as well as missing data states (`undefined`).

### Key Findings:
1. **Discontinuity & Boundary Step Jump (P1):** Crossing from `ideal.min` to `ideal.min - 1` triggers an immediate **12-point penalty** per deficient nutrient in $S_{soil}$, causing an abrupt **4-5 percentage point drop** in final composite suitability score regardless of how marginal the deficit is.
2. **Double-Counting Deficiency (P1):** Nutrient deficiency is penalized twice: first continuously via `ratio * 90` in the component score ($nScore$, $pScore$, $kScore$), and second via the fixed `-12 * deficiencyNotes.length` subtraction from $S_{soil}$.
3. **Dampened Sensitivity across Severe Deficits (P1):** After the initial step penalty, losing $70\%$ more of the required nutrient only drops the final suitability score by an additional $4-5\%$.
4. **False "Aligned" Text on Missing Data (P1):** When nutrient parameters are missing (`undefined`), no deficiency notes are generated, leading the engine to report `"N-P-K matrix aligns with crop demand."` even when zero soil testing data is available.

---

## Section A: Current Implementation Analysis

The deterministic soil suitability score ($S_{soil}$) and composite suitability score ($S_{composite}$) are computed in `src/services/cropSuitabilityEngine.ts` as follows:

### 1. pH Component Score ($phScore$)
- Optimal Range ($\text{optimalPhMin} \le \text{pH} \le \text{optimalPhMax}$): **100**
- Tolerable Range ($\text{phMin} \le \text{pH} \le \text{phMax}$): **80**
- Within $\pm 1.0$ unit of optimal bounds: **55**
- Otherwise: **30**
- Missing (`undefined`): Default **70**

### 2. N/P/K Component Scores ($nScore, pScore, kScore$)
For each macronutrient $X \in \{N, P, K\}$:
- **Optimal / Safe Excess** ($X_{\min} \le X \le 1.5 \times X_{\max}$): **100**
- **Deficient** ($X < X_{\min}$):
  $$\text{ratio} = \frac{X}{X_{\min}}$$
  $$\text{score} = \max\left(10, \text{Math.round}(\text{ratio} \times 90)\right)$$
  Deficiency Note Pushed: `"<Nutrient> deficient (<X> vs <min> kg/ha min)"`
- **Excessive** ($X > 1.5 \times X_{\max}$): **85**
- **Missing** (`undefined` / `null`): Default **75**

### 3. Raw & Penalized Soil Score ($S_{soil}$)
$$\text{rawSoilScore} = \text{Math.round}(0.40 \times phScore + 0.25 \times nScore + 0.20 \times pScore + 0.15 \times kScore)$$

If $\text{deficiencyNotes.length} > 0$:
$$S_{soil} = \max\left(20, \text{rawSoilScore} - 12 \times \text{deficiencyNotes.length}\right)$$

### 4. Composite Suitability Score ($S_{composite}$)
$$S_{composite} = \text{Math.round}(0.35 \times S_{soil} + 0.25 \times S_{season} + 0.15 \times S_{weather} + 0.10 \times S_{water} + 0.10 \times S_{rotation} + 0.05 \times S_{regional})$$

---

## Section B: Boundary Analysis ($X = X_{\min}$ vs $X = X_{\min} - 1$)

Evaluating boundary behavior when a nutrient crosses the minimum requirement threshold ($X_{\min}$):

### Radish Phosphorus Example ($P_{\min} = 30\text{ kg/ha}$)
- **At $P = 30\text{ kg/ha}$ ($1.00 \times \text{min}$):**
  - $pScore = 100$
  - $\text{deficiencyNotes} = []$ ($\text{length} = 0$)
  - $S_{soil} = 100$
  - $S_{composite} = 96\%$
  - Key Factor Text: `"Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand."`
- **At $P = 29\text{ kg/ha}$ ($0.97 \times \text{min}$):**
  - $\text{ratio} = 29 / 30 = 0.9667 \rightarrow pScore = 87$
  - $\text{deficiencyNotes} = [\text{"Phosphorus deficient (29 vs 30 kg/ha min)"}]$
  - $\text{rawSoilScore} = \text{Math.round}(0.4\times 100 + 0.25\times 100 + 0.2\times 87 + 0.15\times 100) = 97$
  - **With 12-point deficiency penalty:** $S_{soil} = 97 - 12 = 85$
  - $S_{composite} = 91\%$ (**Immediate 5% composite drop for 1 kg/ha loss!**)
  - Key Factor Text: `"Soil pH (7.2) is optimal. (Phosphorus deficient (29 vs 30 kg/ha min) - basal fertilizer required)"`

---

## Section C: Sensitivity Tables

*Test Farm Context: Location: Transad, Gujarat; Current Crop: Wheat; Water Source: River; pH: 7.2.*

### 1. Radish ($N_{\min}=40, P_{\min}=30, K_{\min}=40\text{ kg/ha}$)

#### Phosphorus (P) Sensitivity ($N=240, K=280, \text{pH}=7.2$)
| P (kg/ha) | Ratio | pScore | Deficient? | $S_{soil}$ | $S_{composite}$ | Soil Assessment Text |
|---:|---:|---:|:---:|---:|---:|---|
| **30** | 1.00 | 100 | No | 100 | 96% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **29** | 0.97 | 87 | Yes | 85 | 91% | Soil pH (7.2) is optimal. (Phosphorus deficient (29 vs 30 kg/ha min) - basal fertilizer required) |
| **27** | 0.90 | 81 | Yes | 84 | 90% | Soil pH (7.2) is optimal. (Phosphorus deficient (27 vs 30 kg/ha min) - basal fertilizer required) |
| **23** | 0.77 | 69 | Yes | 81 | 89% | Soil pH (7.2) is optimal. (Phosphorus deficient (23 vs 30 kg/ha min) - basal fertilizer required) |
| **18** | 0.60 | 54 | Yes | 78 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (18 vs 30 kg/ha min) - basal fertilizer required) |
| **15** | 0.50 | 45 | Yes | 76 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (15 vs 30 kg/ha min) - basal fertilizer required) |
| **8** | 0.27 | 24 | Yes | 72 | 86% | Soil pH (7.2) is optimal. (Phosphorus deficient (8 vs 30 kg/ha min) - basal fertilizer required) |

#### Nitrogen (N) Sensitivity ($P=40, K=280, \text{pH}=7.2$)
| N (kg/ha) | Ratio | nScore | Deficient? | $S_{soil}$ | $S_{composite}$ | Soil Assessment Text |
|---:|---:|---:|:---:|---:|---:|---|
| **40** | 1.00 | 100 | No | 100 | 96% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **39** | 0.97 | 88 | Yes | 85 | 91% | Soil pH (7.2) is optimal. (Nitrogen deficient (39 vs 40 kg/ha min) - basal fertilizer required) |
| **36** | 0.90 | 81 | Yes | 83 | 90% | Soil pH (7.2) is optimal. (Nitrogen deficient (36 vs 40 kg/ha min) - basal fertilizer required) |
| **30** | 0.75 | 68 | Yes | 80 | 89% | Soil pH (7.2) is optimal. (Nitrogen deficient (30 vs 40 kg/ha min) - basal fertilizer required) |
| **24** | 0.60 | 54 | Yes | 77 | 88% | Soil pH (7.2) is optimal. (Nitrogen deficient (24 vs 40 kg/ha min) - basal fertilizer required) |
| **20** | 0.50 | 45 | Yes | 74 | 87% | Soil pH (7.2) is optimal. (Nitrogen deficient (20 vs 40 kg/ha min) - basal fertilizer required) |
| **10** | 0.25 | 23 | Yes | 69 | 85% | Soil pH (7.2) is optimal. (Nitrogen deficient (10 vs 40 kg/ha min) - basal fertilizer required) |

#### Potassium (K) Sensitivity ($N=240, P=40, \text{pH}=7.2$)
| K (kg/ha) | Ratio | kScore | Deficient? | $S_{soil}$ | $S_{composite}$ | Soil Assessment Text |
|---:|---:|---:|:---:|---:|---:|---|
| **40** | 1.00 | 100 | No | 100 | 96% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **39** | 0.97 | 88 | Yes | 86 | 91% | Soil pH (7.2) is optimal. (Potassium deficient (39 vs 40 kg/ha min) - basal fertilizer required) |
| **36** | 0.90 | 81 | Yes | 85 | 91% | Soil pH (7.2) is optimal. (Potassium deficient (36 vs 40 kg/ha min) - basal fertilizer required) |
| **30** | 0.75 | 68 | Yes | 83 | 90% | Soil pH (7.2) is optimal. (Potassium deficient (30 vs 40 kg/ha min) - basal fertilizer required) |
| **24** | 0.60 | 54 | Yes | 81 | 89% | Soil pH (7.2) is optimal. (Potassium deficient (24 vs 40 kg/ha min) - basal fertilizer required) |
| **20** | 0.50 | 45 | Yes | 80 | 89% | Soil pH (7.2) is optimal. (Potassium deficient (20 vs 40 kg/ha min) - basal fertilizer required) |
| **10** | 0.25 | 23 | Yes | 76 | 88% | Soil pH (7.2) is optimal. (Potassium deficient (10 vs 40 kg/ha min) - basal fertilizer required) |

---

### 2. Pearl Millet ($N_{\min}=40, P_{\min}=20, K_{\min}=20\text{ kg/ha}$)

#### Phosphorus (P) Sensitivity ($N=240, K=280, \text{pH}=7.2$)
| P (kg/ha) | Ratio | pScore | Deficient? | $S_{soil}$ | $S_{composite}$ | Soil Assessment Text |
|---:|---:|---:|:---:|---:|---:|---|
| **20** | 1.00 | 100 | No | 100 | 93% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **19** | 0.95 | 86 | Yes | 85 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (19 vs 20 kg/ha min) - basal fertilizer required) |
| **18** | 0.90 | 81 | Yes | 84 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (18 vs 20 kg/ha min) - basal fertilizer required) |
| **15** | 0.75 | 68 | Yes | 81 | 87% | Soil pH (7.2) is optimal. (Phosphorus deficient (15 vs 20 kg/ha min) - basal fertilizer required) |
| **12** | 0.60 | 54 | Yes | 78 | 86% | Soil pH (7.2) is optimal. (Phosphorus deficient (12 vs 20 kg/ha min) - basal fertilizer required) |
| **10** | 0.50 | 45 | Yes | 76 | 85% | Soil pH (7.2) is optimal. (Phosphorus deficient (10 vs 20 kg/ha min) - basal fertilizer required) |
| **5** | 0.25 | 23 | Yes | 72 | 84% | Soil pH (7.2) is optimal. (Phosphorus deficient (5 vs 20 kg/ha min) - basal fertilizer required) |

---

### 3. Bitter Gourd ($N_{\min}=60, P_{\min}=30, K_{\min}=40\text{ kg/ha}$)

#### Phosphorus (P) Sensitivity ($N=240, K=280, \text{pH}=7.2$)
| P (kg/ha) | Ratio | pScore | Deficient? | $S_{soil}$ | $S_{composite}$ | Soil Assessment Text |
|---:|---:|---:|:---:|---:|---:|---|
| **30** | 1.00 | 100 | No | 100 | 94% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **29** | 0.97 | 87 | Yes | 85 | 89% | Soil pH (7.2) is optimal. (Phosphorus deficient (29 vs 30 kg/ha min) - basal fertilizer required) |
| **27** | 0.90 | 81 | Yes | 84 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (27 vs 30 kg/ha min) - basal fertilizer required) |
| **23** | 0.77 | 69 | Yes | 81 | 87% | Soil pH (7.2) is optimal. (Phosphorus deficient (23 vs 30 kg/ha min) - basal fertilizer required) |
| **18** | 0.60 | 54 | Yes | 78 | 86% | Soil pH (7.2) is optimal. (Phosphorus deficient (18 vs 30 kg/ha min) - basal fertilizer required) |
| **15** | 0.50 | 45 | Yes | 76 | 86% | Soil pH (7.2) is optimal. (Phosphorus deficient (15 vs 30 kg/ha min) - basal fertilizer required) |
| **8** | 0.27 | 24 | Yes | 72 | 84% | Soil pH (7.2) is optimal. (Phosphorus deficient (8 vs 30 kg/ha min) - basal fertilizer required) |

---

### 4. Maize ($N_{\min}=80, P_{\min}=40, K_{\min}=30\text{ kg/ha}$)

#### Phosphorus (P) Sensitivity ($N=240, K=280, \text{pH}=7.2$)
| P (kg/ha) | Ratio | pScore | Deficient? | $S_{soil}$ | $S_{composite}$ | Soil Assessment Text |
|---:|---:|---:|:---:|---:|---:|---|
| **40** | 1.00 | 100 | No | 100 | 96% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **39** | 0.97 | 88 | Yes | 85 | 91% | Soil pH (7.2) is optimal. (Phosphorus deficient (39 vs 40 kg/ha min) - basal fertilizer required) |
| **36** | 0.90 | 81 | Yes | 84 | 90% | Soil pH (7.2) is optimal. (Phosphorus deficient (36 vs 40 kg/ha min) - basal fertilizer required) |
| **30** | 0.75 | 68 | Yes | 81 | 89% | Soil pH (7.2) is optimal. (Phosphorus deficient (30 vs 40 kg/ha min) - basal fertilizer required) |
| **24** | 0.60 | 54 | Yes | 78 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (24 vs 40 kg/ha min) - basal fertilizer required) |
| **20** | 0.50 | 45 | Yes | 76 | 88% | Soil pH (7.2) is optimal. (Phosphorus deficient (20 vs 40 kg/ha min) - basal fertilizer required) |
| **10** | 0.25 | 23 | Yes | 72 | 86% | Soil pH (7.2) is optimal. (Phosphorus deficient (10 vs 40 kg/ha min) - basal fertilizer required) |

---

## Section D: Discontinuity Analysis

Comparing $P = P_{\min}$ vs $P = P_{\min} - 1$:
- For **Radish** ($P_{\min}=30$), dropping from $P=30$ to $P=29$ causes $S_{soil}$ to jump from $100$ down to $85$ (a **15-point drop in soil score**).
- This translates to an immediate **5% drop in composite suitability score** ($96\% \rightarrow 91\%$).
- The mathematical root cause is the binary step function `12 * deficiencyNotes.length`. When $P < P_{\min}$, `deficiencyNotes.length` instantly transitions from $0$ to $1$, subtracting 12 points from $S_{raw}$ regardless of whether the deficit is 1 kg/ha or 25 kg/ha.

---

## Section E: Double-Counting & Sensitivity Compression

### Double-Counting Mechanism
Deficiency is penalized in two distinct places:
1. **Component Ratio Reduction:** As soon as $X < X_{\min}$, the component score drops continuously:
   $$xScore = \text{Math.round}(\text{ratio} \times 90)$$
   For $P=29/30$, $pScore$ drops from $100$ to $87$ (reducing $S_{raw}$ by $2.6$ points).
2. **Fixed Subtraction:** `S_soil` then subtracts an additional fixed **12 points** because `deficiencyNotes.length == 1`.

### Sensitivity Compression
Because the 12-point fixed penalty absorbs most of the score reduction at the threshold boundary ($X_{\min}-1$), subsequent drops in nutrient content have very little marginal impact:
- $P = 29$ ($97\%$ of min): Composite score = **91%**
- $P = 8$ ($27\%$ of min): Composite score = **86%**

Losing $70\%$ more phosphorus only reduces the suitability score by **5 percentage points**, making the engine insensitive to severe versus mild nutrient starvation.

---

## Section F: Missing-Value Behavior

When soil test inputs are `undefined` or `null`:

| Scenario | $nScore$ | $pScore$ | $kScore$ | $phScore$ | $\text{length}(\text{defNotes})$ | $S_{soil}$ | $S_{composite}$ (Radish) | Key Factor Explanation Text |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| **All Present ($N=240, P=40, K=280$)** | 100 | 100 | 100 | 100 | 0 | 100 | 96% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **N Missing ($P=40, K=280$)** | 75 | 100 | 100 | 100 | 0 | 94 | 94% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **P Missing ($N=240, K=280$)** | 100 | 75 | 100 | 100 | 0 | 90 | 92% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **K Missing ($N=240, P=40$)** | 100 | 100 | 75 | 100 | 0 | 96 | 95% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **All N, P, K Missing** | 75 | 75 | 75 | 100 | 0 | 85 | 91% | Soil pH (7.2) is optimal. N-P-K matrix aligns with crop demand. |
| **All Soil Parameters Missing** | 75 | 75 | 75 | 70 | 0 | 73 | 86% | Soil pH (7.0) is acceptable. N-P-K matrix aligns with crop demand. |

### Observations:
1. When nutrients are missing, the engine defaults component scores to **75**, which is higher than actual measured low nutrient scores (e.g. $P=15$ yields $pScore=45$).
2. Missing values generate zero deficiency notes. Consequently, the key factor text falsely claims `"N-P-K matrix aligns with crop demand."` even when no soil test results exist.

---

## Section G: Audit Findings Summary

| ID | Category | Severity | Description |
|---|---|---|---|
| **F-01** | Scoring Model | **P1** | **Discontinuity at Boundary:** Fixed penalty `12 * deficiencyNotes.length` creates a step-function score drop at $X = X_{\min} - 1$. |
| **F-02** | Scoring Model | **P1** | **Double-Counting Deficiency:** Deficiencies are penalized continuously via `ratio * 90` AND discretely via `-12` per note in $S_{soil}$. |
| **F-03** | Scoring Model | **P1** | **Compressed Deficit Sensitivity:** Severe nutrient deficit ($25\%$ of min) score differs by only ~5% from mild deficit ($97\%$ of min). |
| **F-04** | User Text | **P1** | **False Alignment Statement on Missing Data:** `deficiencyNotes.length == 0` causes missing nutrient inputs to display `"N-P-K matrix aligns with crop demand."` |
| **F-05** | Fallback Model | **P2** | **Uncertainty Masking:** Default fallback score of 75 for missing nutrients outperforms moderately low real soil test data. |
| **F-06** | Advisory | **P3** | **Basal Fertilizer Qualification:** Deficiency notes recommend basal fertilizer without qualifying dosage or specific amendment type (e.g. DAP/SSP). |

---

## Section H: Conceptual Recommendation (No Code Modifications Made)

To resolve the identified model issues without breaking existing crop rankings or scoring contracts:

1. **Remove Fixed Discrete Penalty Subtraction (`-12 * deficiencyNotes.length`):**
   Rely on continuous piecewise linear or smooth quadratic decay within component scores ($nScore, pScore, kScore$) so that $S_{soil}$ changes continuously as nutrient levels decrease.
2. **Smooth Boundary Decay Function:**
   Refine component nutrient scoring for $X < X_{\min}$ to use a continuous curve that smoothly transitions at $X = X_{\min}$ (100 points) down to severe deficit (e.g., 20 points at $25\%$ min), avoiding step jumps.
3. **Explicit Missing Data Explanation:**
   Differentiate between *"Measured & Sufficient"*, *"Measured & Deficient"*, and *"Unmeasured / Missing"*. When parameters are missing, display `"Soil nutrients unmeasured; standard basal application advised."` rather than claiming alignment.
