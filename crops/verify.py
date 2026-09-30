import csv, os
from collections import Counter

BASE = r"c:\Users\taksh\FarmHelp\crops"

with open(os.path.join(BASE, "crop_mapping_final.csv"), encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
print(f"crop_mapping_final.csv: {len(rows)} rows, cols={list(rows[0].keys())}")

with open(os.path.join(BASE, "farmhelper_crop_master.csv"), encoding="utf-8") as f:
    master = list(csv.DictReader(f))
print(f"farmhelper_crop_master.csv: {len(master)} rows")
for r in master:
    cid = r["crop_id"]
    cn = r["crop_name"]
    cat = r["crop_category"]
    print(f"  {cid} | {cn} | {cat}")

with open(os.path.join(BASE, "crop_mapping_review.csv"), encoding="utf-8") as f:
    review = list(csv.DictReader(f))
print(f"crop_mapping_review.csv: {len(review)} rows")
for r in review:
    print(f"  {r['original_crop_name']} | {r['mapping_confidence']}")

print("crop_mapping_validation_report.md exists:", os.path.exists(os.path.join(BASE, "crop_mapping_validation_report.md")))

VALID_FH = {"Barley","Basmati Rice","Finger Millet","Maize","Pearl Millet","Rice","Sorghum","Wheat",
"Black Gram","Chickpea","Green Gram","Horse Gram","Lentil","Moth Bean","Pigeon Pea",
"Mustard","Soybean","Sunflower","Cotton","Jute",
"Bitter Gourd","Bottle Gourd","Brinjal","Cabbage","Carrot","Cauliflower","Cucumber",
"Drumstick","Garlic","Okra","Onion","Potato","Pumpkin","Radish","Ridge Gourd","Tomato",
"Apple","Banana","Coconut","Grapes","Jackfruit","Mango","Muskmelon","Orange/Mandarin",
"Papaya","Pomegranate","Watermelon","Black Pepper","Cardamom","Coriander","Turmeric"}

invalid = [r for r in rows if r["farmhelper_crop_name"] not in VALID_FH | {"Unsupported", "Uncertain"}]
print(f"Invalid FH names: {len(invalid)}")
dupes = [k for k, v in Counter(r["original_crop_name"] for r in rows).items() if v > 1]
print(f"Duplicate originals: {dupes}")
print("ALL OK" if not invalid and not dupes else "ISSUES FOUND")
