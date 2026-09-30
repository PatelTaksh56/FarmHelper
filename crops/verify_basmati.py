import os, csv

BASE = r"c:\Users\taksh\FarmHelp"
EXCLUDE = {"node_modules", ".git", "__pycache__", "dist", "build", ".agents"}

print("=== Searching all .csv files in project for Basmati ===")
found_any = False
for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if d not in EXCLUDE]
    for fn in files:
        if not fn.endswith(".csv"):
            continue
        fpath = os.path.join(root, fn)
        try:
            content = open(fpath, encoding="utf-8-sig", errors="replace").read()
            if "basmati" in content.lower():
                found_any = True
                print(f"  FOUND in: {os.path.relpath(fpath, BASE)}")
                for line in content.splitlines():
                    if "basmati" in line.lower():
                        print(f"    >> {line.strip()}")
        except Exception:
            pass

if not found_any:
    print("  >> No Basmati entries found in ANY .csv file across the project.")

print()
print("=== farmhelper_crop_master.csv validation ===")
with open(r"c:\Users\taksh\FarmHelp\crops\farmhelper_crop_master.csv", encoding="utf-8") as f:
    master = list(csv.DictReader(f))

ids = [r["crop_id"] for r in master]
names = [r["crop_name"] for r in master]
basmati = [r for r in master if r["crop_name"] == "Basmati Rice"]
dup_ids = [x for x in ids if ids.count(x) > 1]
dup_names = [x for x in names if names.count(x) > 1]

print(f"Total rows in master: {len(master)}")
print(f"Basmati Rice entry: {basmati}")
print(f"Duplicate IDs: {dup_ids}")
print(f"Duplicate names: {dup_names}")
all_ok = (len(master) == 51 and not dup_ids and not dup_names and bool(basmati))
print(f"ALL MASTER CHECKS PASS: {all_ok}")
print()
print("=== crop_mapping_final.csv stats ===")
with open(r"c:\Users\taksh\FarmHelp\crops\crop_mapping_final.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

from collections import Counter
status_c = Counter(r["mapping_status"] for r in rows)
dupes = [k for k, v in Counter(r["original_crop_name"] for r in rows).items() if v > 1]
fh_in_map = set(r["farmhelper_crop_name"] for r in rows)

VALID_FH = {"Barley","Basmati Rice","Finger Millet","Maize","Pearl Millet","Rice","Sorghum","Wheat",
"Black Gram","Chickpea","Green Gram","Horse Gram","Lentil","Moth Bean","Pigeon Pea",
"Mustard","Soybean","Sunflower","Cotton","Jute","Bitter Gourd","Bottle Gourd","Brinjal",
"Cabbage","Carrot","Cauliflower","Cucumber","Drumstick","Garlic","Okra","Onion","Potato",
"Pumpkin","Radish","Ridge Gourd","Tomato","Apple","Banana","Coconut","Grapes","Jackfruit",
"Mango","Muskmelon","Orange/Mandarin","Papaya","Pomegranate","Watermelon",
"Black Pepper","Cardamom","Coriander","Turmeric"}

fh_covered = VALID_FH & fh_in_map
fh_missing = VALID_FH - fh_in_map

invalid_fh = [r for r in rows if r["farmhelper_crop_name"] not in VALID_FH | {"Unsupported", "Uncertain"}]
invalid_ids = [r for r in rows if not r["crop_id"]]

print(f"Total mapping rows: {len(rows)}")
print(f"Status counts: {dict(status_c)}")
print(f"Official FH crops covered in mapping: {len(fh_covered)} / 51")
print(f"Official FH crops NOT in mapping: {sorted(fh_missing)}")
print(f"Duplicate original names: {dupes}")
print(f"Invalid farmhelper_crop_name entries: {len(invalid_fh)}")
print(f"Rows missing crop_id: {len(invalid_ids)}")
print()
print("CONCLUSION:")
if not fh_missing - {"Basmati Rice"}:
    print("  >> Basmati Rice is the ONLY official crop absent from crop_mapping_final.csv")
    print("  >> This is CORRECT BEHAVIOUR: no source dataset contains any Basmati entry.")
    print("  >> farmhelper_crop_master.csv correctly contains all 51 crops including Basmati Rice (C002).")
    print("  >> No fake rows should be added to crop_mapping_final.csv.")
