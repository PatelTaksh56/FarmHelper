import csv
import json

filepath = 'crops/crop-wise-area-production-yield-mapped.csv'

# Load mapping
mapping = {}
with open('crops/crop_mapping_final.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        orig = r['original_crop_name'].strip().lower()
        target = r['farmhelper_crop_name'].strip()
        cid = r['crop_id'].strip()
        mapping[orig] = {'farmhelper_crop': target, 'crop_id': cid}
        norm = r['normalized_crop_name'].strip().lower()
        mapping[norm] = {'farmhelper_crop': target, 'crop_id': cid}

# Load master crops C001-C051
master_crops = {}
with open('crops/farmhelper_crop_master.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        master_crops[r['crop_id'].strip()] = r['crop_name'].strip()

states = set()
districts = set()
crop_raw_set = set()
mapped_crops_set = set()
mapped_crop_ids = set()
years = set()

area_units = set()
prod_units = set()
yield_units = set()

yield_match_count = 0
yield_mismatch_count = 0
yield_mismatch_examples = []

ahmedabad_rows = 0
ahmedabad_crops = set()
ahmedabad_years = set()

gujarat_districts = set()

row_count = 0
sample_records = []

negative_area = 0
negative_prod = 0
negative_yield = 0

combo_keys = set()
duplicates = 0

with open(filepath, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        row_count += 1
        if len(sample_records) < 3:
            sample_records.append(row)
            
        st = row['state_name'].strip()
        dt = row['district_name'].strip()
        cr = row['crop_name'].strip()
        yr = row['year'].strip()
        
        states.add(st)
        districts.add(f"{st} -> {dt}")
        if st.lower() == 'gujarat':
            gujarat_districts.add(dt)
            if dt.lower() == 'ahmedabad':
                ahmedabad_rows += 1
                ahmedabad_crops.add(cr)
                ahmedabad_years.add(yr)

        crop_raw_set.add(cr)
        years.add(yr)
        
        area_units.add(row['area_unit'].strip())
        prod_units.add(row['production_unit'].strip())
        yield_units.add(row['yield_unit'].strip())

        # Check mapping
        m_info = mapping.get(cr.lower())
        if m_info and m_info['farmhelper_crop'] != 'Unsupported':
            mapped_crops_set.add(m_info['farmhelper_crop'])
            mapped_crop_ids.add(m_info['crop_id'])

        # Numeric checks
        try:
            a = float(row['area'])
            if a < 0: negative_area += 1
        except ValueError:
            a = None
            
        try:
            p = float(row['production']) if row['production'] else None
            if p is not None and p < 0: negative_prod += 1
        except ValueError:
            p = None

        try:
            y = float(row['yield']) if row['yield'] else None
            if y is not None and y < 0: negative_yield += 1
        except ValueError:
            y = None

        # Check yield formula match
        if a is not None and p is not None and y is not None and a > 0:
            calc_yield = p / a
            # Compare calc_yield with y
            if abs(calc_yield - y) < 0.05 or (y > 0 and abs((calc_yield - y)/y) < 0.05):
                yield_match_count += 1
            else:
                yield_mismatch_count += 1
                if len(yield_mismatch_examples) < 5:
                    yield_mismatch_examples.append({
                        'crop': cr, 'year': yr, 'area': a, 'area_unit': row['area_unit'],
                        'production': p, 'production_unit': row['production_unit'],
                        'given_yield': y, 'calculated_yield': round(calc_yield, 4),
                        'yield_unit': row['yield_unit']
                    })

        key = (st.lower(), dt.lower(), cr.lower(), row['season'].strip().lower(), yr)
        if key in combo_keys:
            duplicates += 1
        else:
            combo_keys.add(key)

print("=== DATASET A DETAILED AUDIT RESULTS ===")
print(f"Total Rows: {row_count}")
print(f"Sample records: {json.dumps(sample_records[:2], indent=2)}")
print(f"Unique States ({len(states)}): {sorted(list(states))[:10]}...")
print(f"Unique Districts: {len(districts)}")
print(f"Gujarat Districts ({len(gujarat_districts)}): {sorted(list(gujarat_districts))}")
print(f"Ahmedabad Records: {ahmedabad_rows}, Unique Crops: {len(ahmedabad_crops)}, Unique Years: {len(ahmedabad_years)}")
print(f"Unique Raw Crop Names: {len(crop_raw_set)}")
print(f"Mapped to FarmHelper Official Crops: {len(mapped_crops_set)} of 51")
print(f"Mapped Official Crop IDs: {sorted(list(mapped_crop_ids))}")

missing_master_crops = [cid for cid in master_crops if cid not in mapped_crop_ids]
print(f"Master Crops with NO historical records in Dataset A ({len(missing_master_crops)}):")
for cid in missing_master_crops:
    print(f"  {cid}: {master_crops[cid]}")

print(f"\nTime Coverage: Years {min(years)} to {max(years)} ({len(years)} unique years)")
print(f"Unique Years list: {sorted(list(years))}")

print(f"\nUnits used:")
print(f"  Area Units: {area_units}")
print(f"  Production Units: {prod_units}")
print(f"  Yield Units: {yield_units}")

print(f"\nYield Math Check:")
print(f"  Yield Matches (production/area ~= yield): {yield_match_count}")
print(f"  Yield Mismatches: {yield_mismatch_count}")
print(f"  Mismatch Examples: {json.dumps(yield_mismatch_examples, indent=2)}")

print(f"\nNegative Values:")
print(f"  Negative Area: {negative_area}, Negative Production: {negative_prod}, Negative Yield: {negative_yield}")
print(f"Duplicate (state, district, crop, season, year) records: {duplicates}")
