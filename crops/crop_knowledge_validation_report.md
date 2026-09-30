# Crop Knowledge Validation Report

**Generated:** 2026-09-27  
**Dataset:** `crop_knowledge.csv`  
**Master File:** `farmhelper_crop_master.csv`

---

## 1. Summary Counts

| Metric | Value | Status |
|---|---|---|
| Total crops | **51** | PASS (Matches master 51) |
| Duplicate crop IDs | **0** | PASS |
| Duplicate crop names | **0** | PASS |
| Missing crop IDs | **0** | PASS |
| Invalid crop IDs | **0** | PASS |
| Invalid categories | **0** | PASS |
| Invalid numeric values | **0** | PASS |
| Impossible ranges (min > max) | **0** | PASS |
| Missing source attribution | **0** | PASS |

---

## 2. Confidence Distribution

| Confidence Level | Count | Percentage |
|---|---|---|
| High | **51** | 100.0% |
| Medium | **0** | 0.0% |
| Low | **0** | 0.0% |

---

## 3. Data Sources Used

| Source Identifier | Count | Description |
|---|---|---|
| `multiple_sources` | **50** | Integrated ICAR Package of Practices, SAU Agromet Bulletins, and Kaggle Recommendation Datasets |
| `fertilizer_merged` | **1** | Fertilizer dataset specs |
| `farmhelper_crop_master` | **0** | Master reference |

---

## 4. Blank Values by Column

| Column Name | Blank Count | Population Rate |
|---|---|---|
| `crop_id` | 0 | 100.0% |
| `crop_name` | 0 | 100.0% |
| `crop_category` | 0 | 100.0% |
| `temperature_min_c` | 0 | 100.0% |
| `temperature_optimal_min_c` | 0 | 100.0% |
| `temperature_optimal_max_c` | 0 | 100.0% |
| `temperature_max_c` | 0 | 100.0% |
| `rainfall_min_mm` | 0 | 100.0% |
| `rainfall_optimal_min_mm` | 0 | 100.0% |
| `rainfall_optimal_max_mm` | 0 | 100.0% |
| `rainfall_max_mm` | 0 | 100.0% |
| `humidity_min_percent` | 0 | 100.0% |
| `humidity_optimal_min_percent` | 0 | 100.0% |
| `humidity_optimal_max_percent` | 0 | 100.0% |
| `humidity_max_percent` | 0 | 100.0% |
| `ph_min` | 0 | 100.0% |
| `ph_optimal_min` | 0 | 100.0% |
| `ph_optimal_max` | 0 | 100.0% |
| `ph_max` | 0 | 100.0% |
| `nitrogen_min` | 0 | 100.0% |
| `nitrogen_optimal_min` | 0 | 100.0% |
| `nitrogen_optimal_max` | 0 | 100.0% |
| `nitrogen_max` | 0 | 100.0% |
| `phosphorus_min` | 0 | 100.0% |
| `phosphorus_optimal_min` | 0 | 100.0% |
| `phosphorus_optimal_max` | 0 | 100.0% |
| `phosphorus_max` | 0 | 100.0% |
| `potassium_min` | 0 | 100.0% |
| `potassium_optimal_min` | 0 | 100.0% |
| `potassium_optimal_max` | 0 | 100.0% |
| `potassium_max` | 0 | 100.0% |
| `soil_moisture_min_percent` | 0 | 100.0% |
| `soil_moisture_optimal_min_percent` | 0 | 100.0% |
| `soil_moisture_optimal_max_percent` | 0 | 100.0% |
| `soil_moisture_max_percent` | 0 | 100.0% |
| `soil_types` | 0 | 100.0% |
| `water_requirement` | 0 | 100.0% |
| `drought_tolerance` | 0 | 100.0% |
| `waterlogging_tolerance` | 0 | 100.0% |
| `temperature_tolerance` | 0 | 100.0% |
| `growth_duration_days` | 0 | 100.0% |
| `source` | 0 | 100.0% |
| `source_notes` | 0 | 100.0% |
| `confidence` | 0 | 100.0% |

---

## 5. Unit Assumptions & Standardization Rules

- **Temperature**: Celsius (°C). Represents general growth and thermal suitability bounds (`temperature_min_c` to `temperature_max_c`).
- **Rainfall**: Millimeters (mm). Represents total seasonal / crop-cycle water requirement.
- **Humidity**: Percentage (%). Relative humidity tolerance during vegetative and reproductive stages.
- **Soil pH**: Standard 0.0–14.0 pH scale.
- **Nitrogen (N), Phosphorus (P), Potassium (K)**: Recommended elemental application rates in **kg/ha** as established in ICAR / SAU fertilizer guidelines.
- **Soil Moisture**: Volumetric soil moisture percentage (%).
- **Soil Types**: Controlled, human-readable list of compatible soil textures (e.g. `loamy, sandy loam, well-drained`).
- **Water Requirement**: Controlled vocabulary: `Low`, `Moderate`, `High`, `Very High`.
- **Drought / Waterlogging / Temperature Tolerance**: Controlled vocabulary: `Low`, `Moderate`, `High`, `Unknown`.

---

## 6. Fields Requiring Future Improvement

The following parameters could not be safely populated with uniform precision across all 51 crops without introducing fake precision:

1. **Daily Soil Moisture Curves (% Volumetric)**: While soil moisture min/max percentages are established for major crops, stage-by-stage daily soil moisture depletion curves vary by soil texture and irrigation regime.
2. **EC (Electrical Conductivity, dS/m) Salinity Thresholds**: Sourced for major cereals and pulses, but unmeasured for niche spices in standard datasets.
3. **Organic Carbon (OC %) Min Thresholds**: Available in ICAR state handbooks but omitted from generic recommendation CSVs.

---

## 7. Operational Readiness

- ✅ **`crop_knowledge.csv` is fully validated and ready to serve as FarmHelper's static crop-knowledge layer.**
- ✅ **Dynamic weather data is explicitly excluded** (to be supplied dynamically by the OpenWeather API at runtime).
- ✅ **100% 1-to-1 match with `farmhelper_crop_master.csv`** (`C001` through `C051`).
