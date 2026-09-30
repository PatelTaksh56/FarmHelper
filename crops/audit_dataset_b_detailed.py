import csv
import json

filepath = 'crops/District_Level_Data_merged.csv'

# Load mapping
mapping = {}
with open('crops/crop_mapping_final.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        orig = r['original_crop_name'].strip().lower()
        target = r['farmhelper_crop_name'].strip()
        cid = r['crop_id'].strip()
        mapping[orig] = {'farmhelper_crop': target, 'crop_id': cid}

master = {}
with open('crops/farmhelper_crop_master.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        master[r['crop_name'].strip()] = r['crop_id'].strip()

states = set()
districts = set()
years = set()
ahmedabad_rows = 0
ahmedabad_years = set()
gujarat_districts = set()

row_count = 0

with open(filepath, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    header = reader.fieldnames
    
    missing_per_col = {col: 0 for col in header}
    negative_per_col = {col: 0 for col in header}
    zero_per_col = {col: 0 for col in header}

    for row in reader:
        row_count += 1
        st = row['State Name'].strip()
        dt = row['Dist Name'].strip()
        yr = row['Year'].strip()
        
        states.add(st)
        districts.add(f"{st} -> {dt}")
        years.add(yr)
        
        if st.lower() == 'gujarat':
            gujarat_districts.add(dt)
            if dt.lower() == 'ahmedabad':
                ahmedabad_rows += 1
                ahmedabad_years.add(yr)

        for col in header:
            val = row[col].strip()
            if not val or val in ['-1', '-1.0', '-1.00', 'NULL', 'nan']:
                missing_per_col[col] += 1
            else:
                try:
                    num = float(val)
                    if num < 0:
                        negative_per_col[col] += 1
                    elif num == 0:
                        zero_per_col[col] += 1
                except ValueError:
                    pass

print("=== DATASET B DETAILED AUDIT RESULTS ===")
print(f"Total Rows: {row_count}")
print(f"Total Columns: {len(header)}")
print(f"Unique States ({len(states)}): {sorted(list(states))[:10]}...")
print(f"Unique Districts: {len(districts)}")
print(f"Gujarat Districts ({len(gujarat_districts)}): {sorted(list(gujarat_districts))}")
print(f"Ahmedabad Records: {ahmedabad_rows}, Unique Years: {len(ahmedabad_years)}")
print(f"Time Coverage: Years {min(years)} to {max(years)} ({len(years)} unique years)")
print(f"Unique Years list: {sorted(list(years))}")

# Identify crops in Dataset B column headers
dataset_b_crops = set()
col_crop_map = {}

crop_keywords = [
    'RICE', 'WHEAT', 'KHARIF SORGHUM', 'RABI SORGHUM', 'SORGHUM', 'PEARL MILLET', 'MAIZE',
    'FINGER MILLET', 'BARLEY', 'CHICKPEA', 'PIGEONPEA', 'MINOR PULSES', 'GROUNDNUT', 'SESAMUM',
    'RAPESEED AND MUSTARD', 'SAFFLOWER', 'CASTOR', 'LINSEED', 'SUNFLOWER', 'SOYABEAN', 'OILSEEDS',
    'SUGARCANE', 'COTTON', 'FRUITS', 'VEGETABLES', 'FRUITS AND VEGETABLES', 'POTATOES', 'ONION', 'FODDER'
]

for kw in crop_keywords:
    # Try mapping via crop_mapping_final.csv
    m = mapping.get(kw.lower())
    if m and m['farmhelper_crop'] != 'Unsupported':
        col_crop_map[kw] = m['farmhelper_crop']

print(f"\nCrops represented in Dataset B columns ({len(col_crop_map)} mapped to FarmHelper crops):")
for kw, fh in col_crop_map.items():
    print(f"  Column Keyword: '{kw}' -> FarmHelper Crop: '{fh}'")

mapped_fh_crops_b = set(col_crop_map.values())
print(f"\nTotal Official FarmHelper Crops Covered in Dataset B: {len(mapped_fh_crops_b)} of 51")
print(f"Mapped Crops: {sorted(list(mapped_fh_crops_b))}")
missing_b = set(master.keys()) - mapped_fh_crops_b
print(f"Official Crops MISSING in Dataset B ({len(missing_b)}):")
for m in sorted(list(missing_b)):
    print(f"  - {m}")
