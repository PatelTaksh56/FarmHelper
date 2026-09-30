# FarmHelper Crop Advisor — Gemini Agronomic Exploration Mode (Mode C)

## 1. Concept & Philosophy

When the deterministic FarmHelper agronomic feasibility engine returns zero validated candidate crops, the system must **not** conclude that *"no crop can be grown in the real world."*

Instead, zero candidates means:
> *"FarmHelper currently has no district-specific validated crop recommendation in its current dataset for this planting window."*

In this situation, the pipeline activates **Mode C: Gemini Agronomic Exploration Mode**.

---

## 2. Three Operational Modes

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ MODE A: VALIDATED RECOMMENDATIONS                                           │
│ Candidate crops pass all 5 hard gates AND soil nutrients (N/P/K) are ideal. │
│ -> Gemini explains ONLY deterministic eligible crops.                       │
│ -> Score: Validated numerical score (e.g. 91%).                             │
│ -> Label: "Suitable for your farm"                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODE B: VALIDATED RECOMMENDATIONS WITH MANAGEMENT                           │
│ Candidate crops pass all 5 hard gates BUT have correctable N/P/K deficits.  │
│ -> Gemini explains candidates & nutrient management considerations.         │
│ -> Score: Validated numerical score (e.g. 76%).                             │
│ -> Label: "Suitable with Management"                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODE C: AGRONOMIC EXPLORATION                                               │
│ Zero candidate crops pass deterministic district feasibility gates.         │
│ -> Gemini explores 3-5 potential crop alternatives using farm context.      │
│ -> Score: NO numerical score! Uses qualitative "AI Potential: HIGH/MED/LOW".│
│ -> Label: "AI-Derived — Not District Validated"                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow & Security

- **Server-Side API Key Security**: Requests from React call the secure Firebase Cloud Function `/adviseCrop` with the user's Firebase Auth ID token (`Authorization: Bearer <idToken>`).
- **Zero Client API Key Leakage**: No `VITE_GEMINI_API_KEY` exists in client-side source or build artifacts.
- **Null Soil Parameter Handling**: Unmeasured soil parameters are transmitted as `null` (never `0`).
- **Target Sowing Date**: Computed deterministically (`expectedHarvestDate + 12 days turnaround`).
- **Validation Status Enforcement**: Server-side code explicitly verifies and tags every exploration crop with `validationStatus: "AI_DERIVED_NOT_DISTRICT_VALIDATED"`.

---

## 4. Response Schema for Mode C

```json
{
  "mode": "AGRONOMIC_EXPLORATION",
  "overallSummary": "...",
  "potentialCrops": [
    {
      "cropName": "...",
      "aiPotential": "HIGH",
      "whyItMayFit": "...",
      "soilAssessment": "...",
      "weatherAssessment": "...",
      "waterAssessment": "...",
      "rotationAssessment": "...",
      "plantingWindowAssessment": "...",
      "nutrientConsiderations": ["Nitrogen level is below crop demand; soil test-based fertilization required."],
      "keyRisks": ["Uncertain district sowing window; confirm local KVK recommendations."],
      "uncertainties": ["Exact district sowing evidence missing from dataset."],
      "confidenceExplanation": "...",
      "validationStatus": "AI_DERIVED_NOT_DISTRICT_VALIDATED"
    }
  ]
}
```

---

## 5. UI Presentation & Disclaimers

1. **Deterministic Audit Breakdown**: Presented first to show why FarmHelper's validated dataset could not produce a recommendation (outside sowing window count, missing district evidence count, perennial count, etc.).
2. **AI Agronomic Exploration Section**: Rendered below the audit with an explicit amber disclaimer header.
3. **Card Design**: Uses distinct warm amber borders (`border-amber-300`), qualitative rating badges (`AI Potential: HIGH`), and an explicit bottom warning banner:
   > *⚠️ AI-derived potential crop — requires local agronomic verification before field implementation.*
