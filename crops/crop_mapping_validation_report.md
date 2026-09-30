# FarmHelper Crop Mapping Validation Report

```text
=== FARMHELPER CROP MAPPING VALIDATION ===

Mapping file:
crop_mapping_final.csv
Total mapping rows:
404

Master file:
farmhelper_crop_master.csv
Total master rows:
51

Official FarmHelper crops:
51

Master crops present:
51

Missing master crops:
0

Duplicate crop IDs:
0

Duplicate crop names:
0

Missing crop IDs:
0

Basmati Rice:
Present = YES
crop_id = C002

Supported mapping rows:
246

Unsupported mapping rows:
158

Uncertain mapping rows:
16

Conflicting mappings:
0

Blank required fields:
0

Overall result:
PASS
```

---

## Master File Inventory (`farmhelper_crop_master.csv`)

| crop_id | crop_name | crop_category |
|---|---|---|
| C001 | Barley | Cereals |
| C002 | Basmati Rice | Cereals |
| C003 | Finger Millet | Cereals |
| C004 | Maize | Cereals |
| C005 | Pearl Millet | Cereals |
| C006 | Rice | Cereals |
| C007 | Sorghum | Cereals |
| C008 | Wheat | Cereals |
| C009 | Black Gram | Pulses |
| C010 | Chickpea | Pulses |
| C011 | Green Gram | Pulses |
| C012 | Horse Gram | Pulses |
| C013 | Lentil | Pulses |
| C014 | Moth Bean | Pulses |
| C015 | Pigeon Pea | Pulses |
| C016 | Mustard | Oilseeds |
| C017 | Soybean | Oilseeds |
| C018 | Sunflower | Oilseeds |
| C019 | Cotton | Cash Crops |
| C020 | Jute | Cash Crops |
| C021 | Bitter Gourd | Vegetables |
| C022 | Bottle Gourd | Vegetables |
| C023 | Brinjal | Vegetables |
| C024 | Cabbage | Vegetables |
| C025 | Carrot | Vegetables |
| C026 | Cauliflower | Vegetables |
| C027 | Cucumber | Vegetables |
| C028 | Drumstick | Vegetables |
| C029 | Garlic | Vegetables |
| C030 | Okra | Vegetables |
| C031 | Onion | Vegetables |
| C032 | Potato | Vegetables |
| C033 | Pumpkin | Vegetables |
| C034 | Radish | Vegetables |
| C035 | Ridge Gourd | Vegetables |
| C036 | Tomato | Vegetables |
| C037 | Apple | Fruits |
| C038 | Banana | Fruits |
| C039 | Coconut | Fruits |
| C040 | Grapes | Fruits |
| C041 | Jackfruit | Fruits |
| C042 | Mango | Fruits |
| C043 | Muskmelon | Fruits |
| C044 | Orange/Mandarin | Fruits |
| C045 | Papaya | Fruits |
| C046 | Pomegranate | Fruits |
| C047 | Watermelon | Fruits |
| C048 | Black Pepper | Spices |
| C049 | Cardamom | Spices |
| C050 | Coriander | Spices |
| C051 | Turmeric | Spices |

---

## Architectural Summary

1. **`farmhelper_crop_master.csv`**: Contains all 51 official crops (`C001` to `C051`), serving as the authoritative reference for FarmHelper. `Basmati Rice` is explicitly assigned `C002`.
2. **`crop_mapping_final.csv`**: Maps 404 raw crop names from source datasets to FarmHelper crop names and master IDs. It preserves 404 source rows, 246 supported mappings, and 158 unsupported entries.
3. **Backup**: Created `crop_mapping_final_backup.csv`.
