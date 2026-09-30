import csv

# Load master
master_crops = []
with open('crops/farmhelper_crop_master.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        master_crops.append({
            'crop_id': r['crop_id'].strip(),
            'crop_name': r['crop_name'].strip(),
            'crop_category': r['crop_category'].strip()
        })

# Load mapping
mapping = {}
with open('crops/crop_mapping_final.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        orig = r['original_crop_name'].strip().lower()
        target = r['farmhelper_crop_name'].strip()
        cid = r['crop_id'].strip()
        conf = r['mapping_confidence'].strip()
        mapping[orig] = {'target': target, 'crop_id': cid, 'confidence': conf}
        norm = r['normalized_crop_name'].strip().lower()
        mapping[norm] = {'target': target, 'crop_id': cid, 'confidence': conf}

# Count records in Dataset A
dataset_a_counts = {m['crop_name']: 0 for m in master_crops}
with open('crops/crop-wise-area-production-yield-mapped.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        c_raw = r['crop_name'].strip().lower()
        if c_raw in mapping:
            target = mapping[c_raw]['target']
            if target in dataset_a_counts:
                dataset_a_counts[target] += 1

# Check Dataset B coverage
dataset_b_crops = {
    'Barley', 'Chickpea', 'Cotton', 'Maize', 'Onion', 'Pearl Millet', 
    'Pigeon Pea', 'Rice', 'Sorghum', 'Soybean', 'Sunflower', 'Wheat'
}

print("| Crop ID | FarmHelper Crop | Category | Dataset A Records | Dataset B Evidence | Overall Availability | Mapping Confidence |")
print("|---|---|---|---:|:---:|:---:|---|")

for mc in master_crops:
    cid = mc['crop_id']
    cname = mc['crop_name']
    cat = mc['crop_category']
    count_a = dataset_a_counts.get(cname, 0)
    in_b = "YES" if cname in dataset_b_crops else "NO"
    
    avail = "Both A & B" if count_a > 0 and in_b == "YES" else ("Dataset A Only" if count_a > 0 else ("Dataset B Only" if in_b == "YES" else "None"))
    
    # Get mapping confidence from crop_mapping_final
    conf = "Exact"
    for k, v in mapping.items():
        if v['target'] == cname:
            conf = v['confidence']
            break
            
    print(f"| {cid} | {cname} | {cat} | {count_a:,} | {in_b} | {avail} | {conf} |")
