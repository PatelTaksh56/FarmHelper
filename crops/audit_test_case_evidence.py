import csv
import json

print("=== HISTORICAL EVIDENCE AUDIT FOR AHMEDABAD DISTRICT ===")

# Dataset A Ahmedabad records
ds_a_records = []
with open('crops/crop-wise-area-production-yield-mapped.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if r['state_name'].strip().lower() == 'gujarat' and r['district_name'].strip().lower() == 'ahmedabad':
            ds_a_records.append(r)

print(f"\nDataset A: Found {len(ds_a_records)} historical records for Ahmedabad")

# Group by crop in Dataset A
ds_a_by_crop = {}
for r in ds_a_records:
    c = r['crop_name'].strip()
    if c not in ds_a_by_crop:
        ds_a_by_crop[c] = []
    ds_a_by_crop[c].append(r)

print(f"Crops available in Dataset A for Ahmedabad ({len(ds_a_by_crop)} crops):")
for crop, recs in sorted(ds_a_by_crop.items()):
    years = [r['year'] for r in recs]
    recent_yields = [float(r['yield']) for r in recs if r['yield']]
    avg_yield = sum(recent_yields) / len(recent_yields) if recent_yields else 0
    print(f"  - {crop}: {len(recs)} annual records ({min(years)} to {max(years)}) | Avg Yield: {avg_yield:.3f} Tonnes/Ha")

# Dataset B Ahmedabad records
ds_b_records = []
with open('crops/District_Level_Data_merged.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if r['State Name'].strip().lower() == 'gujarat' and r['Dist Name'].strip().lower() == 'ahmedabad':
            ds_b_records.append(r)

print(f"\nDataset B: Found {len(ds_b_records)} historical annual records (1966 to 2019) for Ahmedabad")

wheat_b = [r for r in ds_b_records if r.get('WHEAT YIELD (Kg per ha)') and float(r['WHEAT YIELD (Kg per ha)']) > 0]
if wheat_b:
    wheat_yields_b = [float(r['WHEAT YIELD (Kg per ha)']) for r in wheat_b]
    avg_wheat_b = sum(wheat_yields_b) / len(wheat_yields_b)
    print(f"  - Wheat in Dataset B for Ahmedabad: {len(wheat_b)} years | Avg Yield: {avg_wheat_b:.1f} Kg/Ha (Min: {min(wheat_yields_b)}, Max: {max(wheat_yields_b)})")
