"""Audit crop_mapping_final.csv and produce all required output files."""
import csv, os
from collections import Counter

BASE = r"c:\Users\taksh\FarmHelp\crops"

VALID_FH_CROPS = [
    # Cereals
    "Barley", "Basmati Rice", "Finger Millet", "Maize", "Pearl Millet",
    "Rice", "Sorghum", "Wheat",
    # Pulses
    "Black Gram", "Chickpea", "Green Gram", "Horse Gram", "Lentil",
    "Moth Bean", "Pigeon Pea",
    # Oilseeds
    "Mustard", "Soybean", "Sunflower",
    # Cash Crops
    "Cotton", "Jute",
    # Vegetables
    "Bitter Gourd", "Bottle Gourd", "Brinjal", "Cabbage", "Carrot",
    "Cauliflower", "Cucumber", "Drumstick", "Garlic", "Okra", "Onion",
    "Potato", "Pumpkin", "Radish", "Ridge Gourd", "Tomato",
    # Fruits
    "Apple", "Banana", "Coconut", "Grapes", "Jackfruit", "Mango",
    "Muskmelon", "Orange/Mandarin", "Papaya", "Pomegranate", "Watermelon",
    # Spices
    "Black Pepper", "Cardamom", "Coriander", "Turmeric",
]

assert len(VALID_FH_CROPS) == 51, f"Expected 51 crops, got {len(VALID_FH_CROPS)}"

FH_CATEGORY = {
    "Barley": "Cereals", "Basmati Rice": "Cereals", "Finger Millet": "Cereals",
    "Maize": "Cereals", "Pearl Millet": "Cereals", "Rice": "Cereals",
    "Sorghum": "Cereals", "Wheat": "Cereals",
    "Black Gram": "Pulses", "Chickpea": "Pulses", "Green Gram": "Pulses",
    "Horse Gram": "Pulses", "Lentil": "Pulses", "Moth Bean": "Pulses",
    "Pigeon Pea": "Pulses",
    "Mustard": "Oilseeds", "Soybean": "Oilseeds", "Sunflower": "Oilseeds",
    "Cotton": "Cash Crops", "Jute": "Cash Crops",
    "Bitter Gourd": "Vegetables", "Bottle Gourd": "Vegetables",
    "Brinjal": "Vegetables", "Cabbage": "Vegetables", "Carrot": "Vegetables",
    "Cauliflower": "Vegetables", "Cucumber": "Vegetables",
    "Drumstick": "Vegetables", "Garlic": "Vegetables", "Okra": "Vegetables",
    "Onion": "Vegetables", "Potato": "Vegetables", "Pumpkin": "Vegetables",
    "Radish": "Vegetables", "Ridge Gourd": "Vegetables", "Tomato": "Vegetables",
    "Apple": "Fruits", "Banana": "Fruits", "Coconut": "Fruits",
    "Grapes": "Fruits", "Jackfruit": "Fruits", "Mango": "Fruits",
    "Muskmelon": "Fruits", "Orange/Mandarin": "Fruits", "Papaya": "Fruits",
    "Pomegranate": "Fruits", "Watermelon": "Fruits",
    "Black Pepper": "Spices", "Cardamom": "Spices", "Coriander": "Spices",
    "Turmeric": "Spices",
}

# Stable crop_id assignment (deterministic, sorted by category then name)
CROP_ID_MAP = {}
_id_counter = 1
for _crop in VALID_FH_CROPS:
    CROP_ID_MAP[_crop] = f"C{_id_counter:03d}"
    _id_counter += 1

VALID_FH_SET = set(VALID_FH_CROPS)
VALID_STATUSES = {"Exact", "Alias", "Variant", "Unsupported", "Uncertain"}
VALID_CONFIDENCES = {"High", "Medium", "Low"}
VALID_CATEGORIES = {"Cereals", "Pulses", "Oilseeds", "Cash Crops", "Vegetables", "Fruits", "Spices", "Unsupported"}

# ──────────────────────────────────────────────
# Read current file
# ──────────────────────────────────────────────
with open(os.path.join(BASE, "crop_mapping_final.csv"), encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(f"Loaded {len(rows)} rows")

# ──────────────────────────────────────────────
# AUDIT / FIX
# ──────────────────────────────────────────────
issues = []
review_rows = []
changes_made = []

FIXES = {}  # original_name -> dict of field overrides

# 1. MESTA: status=Uncertain, farmhelper_crop_name=Jute  →  must be Unsupported
#    because we cannot safely map a botanically distinct crop to Jute
FIXES["Mesta"] = {
    "farmhelper_crop_name": "Unsupported",
    "crop_category": "Unsupported",
    "mapping_status": "Uncertain",
    "mapping_confidence": "Medium",
    "mapping_reason": "Mesta (Hibiscus cannabinus/kenaf) is sometimes grouped with Jute in Indian agricultural statistics but is a botanically distinct fibre crop. FarmHelper does not have a separate Mesta entry, and mapping it to Jute would be agriculturally incorrect. Kept Unsupported/Uncertain pending a policy decision.",
}

# 2. Bhatt: normalized_crop_name is "Soybean (Black Variety)" — misleading
FIXES["Bhatt"] = {
    "normalized_crop_name": "Bhatt",
    "mapping_reason": "Bhatt typically refers to a black-seeded soybean-like legume in Uttarakhand (Glycine soja or a local landrace). Cannot safely map to FarmHelper's Soybean without confirmation. Kept Uncertain.",
}

# 3. lowercase variants that are marked Variant but should be Alias (different word form, not formatting)
#    e.g. "apple" -> Apple is a case variant → Variant is fine. Leave these.

# 4. GREEN GRAM (all-caps) is marked Variant — but it's a capitalization variant, Variant is correct.
#    However "BLACK gram" (mixed case) is also Variant — both fine.

# 5. HORSE GRAM is all-caps → Variant is correct.

# 6. Toria: Variant, Medium — correct per spec. No change.

# 7. Muskmelon uppercase/spaced: "Musk Melon" → Variant is correct.

# 8. "Mustard/Toria" — Variant is correct.

# 9. Check: "Coriender" and "coriender" are misspellings → Variant is fine.

# 10. "Tomato (Tamatar)" is missing from visible rows — let's confirm it's there
tomato_tamatar = [r for r in rows if r["original_crop_name"] == "Tomato (Tamatar)"]
if not tomato_tamatar:
    print("WARNING: 'Tomato (Tamatar)' not found!")

# Apply fixes
for row in rows:
    orig = row["original_crop_name"]
    if orig in FIXES:
        fix = FIXES[orig]
        before = {k: row[k] for k in fix}
        row.update(fix)
        changes_made.append({
            "original_crop_name": orig,
            "fields_changed": list(fix.keys()),
            "before": before,
            "after": fix,
        })

# ──────────────────────────────────────────────
# Add crop_id column
# ──────────────────────────────────────────────
UNSUPPORTED_ID = "UNSUPPORTED"

for row in rows:
    fh = row["farmhelper_crop_name"]
    if fh in CROP_ID_MAP:
        row["crop_id"] = CROP_ID_MAP[fh]
    else:
        row["crop_id"] = UNSUPPORTED_ID

# ──────────────────────────────────────────────
# Validate all rows
# ──────────────────────────────────────────────
seen_originals = Counter(r["original_crop_name"] for r in rows)
dupe_originals = [k for k, v in seen_originals.items() if v > 1]

for row in rows:
    orig = row["original_crop_name"]
    fh = row["farmhelper_crop_name"]
    st = row["mapping_status"]
    conf = row["mapping_confidence"]
    cat = row["crop_category"]

    row_issues = []

    if fh not in VALID_FH_SET and fh not in ("Unsupported", "Uncertain"):
        row_issues.append(f"Invalid farmhelper_crop_name: {fh!r}")

    if st == "Uncertain" and fh in VALID_FH_SET:
        row_issues.append(f"Uncertain status but mapped to FH crop {fh!r}")

    if st not in VALID_STATUSES:
        row_issues.append(f"Invalid status: {st!r}")

    if conf not in VALID_CONFIDENCES:
        row_issues.append(f"Invalid confidence: {conf!r}")

    if cat not in VALID_CATEGORIES:
        row_issues.append(f"Invalid category: {cat!r}")

    # Verify category consistency for FH crops
    if fh in CROP_ID_MAP:
        expected_cat = FH_CATEGORY[fh]
        if cat != expected_cat:
            row_issues.append(f"Category mismatch: got {cat!r}, expected {expected_cat!r}")

    if not row["mapping_reason"].strip():
        row_issues.append("Blank mapping_reason")

    if not row["source_files"].strip():
        row_issues.append("Blank source_files")

    for issue in row_issues:
        issues.append({"original_crop_name": orig, "issue": issue})

    if st in ("Uncertain",) or conf == "Low":
        review_rows.append({
            "original_crop_name": orig,
            "normalized_crop_name": row["normalized_crop_name"],
            "current_mapping": fh,
            "proposed_mapping": fh,
            "mapping_status": st,
            "mapping_confidence": conf,
            "reason_for_review": f"Status={st}, Confidence={conf}. Requires human verification before use in Crop Advisor.",
            "source_files": row["source_files"],
        })

# ──────────────────────────────────────────────
# Write crop_mapping_final.csv (with crop_id prepended)
# ──────────────────────────────────────────────
OUT_COLS = [
    "crop_id",
    "original_crop_name",
    "normalized_crop_name",
    "farmhelper_crop_name",
    "crop_category",
    "mapping_status",
    "mapping_confidence",
    "source_files",
    "mapping_reason",
]

with open(os.path.join(BASE, "crop_mapping_final.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=OUT_COLS)
    writer.writeheader()
    writer.writerows(rows)
print("Written: crop_mapping_final.csv")

# ──────────────────────────────────────────────
# Write farmhelper_crop_master.csv
# ──────────────────────────────────────────────
master_rows = []
for crop in VALID_FH_CROPS:
    master_rows.append({
        "crop_id": CROP_ID_MAP[crop],
        "crop_name": crop,
        "crop_category": FH_CATEGORY[crop],
    })

with open(os.path.join(BASE, "farmhelper_crop_master.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["crop_id", "crop_name", "crop_category"])
    writer.writeheader()
    writer.writerows(master_rows)
print("Written: farmhelper_crop_master.csv")

# ──────────────────────────────────────────────
# Write crop_mapping_review.csv
# ──────────────────────────────────────────────
with open(os.path.join(BASE, "crop_mapping_review.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "original_crop_name", "normalized_crop_name", "current_mapping",
        "proposed_mapping", "mapping_status", "mapping_confidence",
        "reason_for_review", "source_files",
    ])
    writer.writeheader()
    writer.writerows(review_rows)
print(f"Written: crop_mapping_review.csv ({len(review_rows)} rows)")

# ──────────────────────────────────────────────
# Print stats for report
# ──────────────────────────────────────────────
status_counts = Counter(r["mapping_status"] for r in rows)
conf_counts = Counter(r["mapping_confidence"] for r in rows)
fh_names_in_map = set(r["farmhelper_crop_name"] for r in rows if r["farmhelper_crop_name"] in VALID_FH_SET)
missing_fh = VALID_FH_SET - fh_names_in_map

print("\n=== STATS ===")
print(f"Total rows: {len(rows)}")
print(f"Status: {dict(status_counts)}")
print(f"Confidence: {dict(conf_counts)}")
print(f"FH crops covered: {len(fh_names_in_map)} / 51")
print(f"FH crops NOT in mapping: {sorted(missing_fh)}")
print(f"Duplicate original names: {dupe_originals}")
print(f"Validation issues found: {len(issues)}")
for iss in issues[:20]:
    print(f"  {iss}")
print(f"Changes made: {len(changes_made)}")
for c in changes_made:
    print(f"  {c['original_crop_name']}: {c['fields_changed']}")
    print(f"    before: {c['before']}")
    print(f"    after:  {c['after']}")
print(f"Review rows: {len(review_rows)}")
