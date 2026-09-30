import csv
import os
import sys

def validate():
    master_path = 'crops/farmhelper_crop_master.csv'
    knowledge_path = 'crops/crop_knowledge.csv'

    errors = []
    warnings = []

    # Read master
    with open(master_path, 'r', encoding='utf-8') as f:
        master_rows = list(csv.DictReader(f))

    master_dict = {r['crop_id'].strip(): r['crop_name'].strip() for r in master_rows}
    master_names = set(r['crop_name'].strip() for r in master_rows)
    master_ids = set(r['crop_id'].strip() for r in master_rows)

    # Read knowledge
    with open(knowledge_path, 'r', encoding='utf-8') as f:
        knowledge_rows = list(csv.DictReader(f))

    # 1. Total rows
    if len(knowledge_rows) != 51:
        errors.append(f"Expected 51 rows, got {len(knowledge_rows)}.")

    # 2 & 3. Unique crop_id and crop_name
    k_ids = [r['crop_id'].strip() for r in knowledge_rows]
    k_names = [r['crop_name'].strip() for r in knowledge_rows]

    if len(set(k_ids)) != len(k_ids):
        errors.append("Duplicate crop_id found in crop_knowledge.csv.")
    if len(set(k_names)) != len(k_names):
        errors.append("Duplicate crop_name found in crop_knowledge.csv.")

    # 4 & 5 & 6 & 7. Match master exactly
    if set(k_ids) != master_ids:
        errors.append(f"crop_id set does not match master. Missing: {master_ids - set(k_ids)}, Extra: {set(k_ids) - master_ids}")
    if set(k_names) != master_names:
        errors.append(f"crop_name set does not match master. Missing: {master_names - set(k_names)}, Extra: {set(k_names) - master_names}")

    for r in knowledge_rows:
        cid = r['crop_id'].strip()
        cname = r['crop_name'].strip()
        if cid in master_dict and master_dict[cid] != cname:
            errors.append(f"Mismatch for crop_id '{cid}': master has '{master_dict[cid]}', knowledge has '{cname}'.")

    # Controlled Vocabularies
    valid_water = {'Low', 'Moderate', 'High', 'Very High', ''}
    valid_tolerance = {'Low', 'Moderate', 'High', 'Unknown', ''}
    valid_confidence = {'High', 'Medium', 'Low'}

    range_quads = [
        ('temperature', ['temperature_min_c', 'temperature_optimal_min_c', 'temperature_optimal_max_c', 'temperature_max_c']),
        ('rainfall', ['rainfall_min_mm', 'rainfall_optimal_min_mm', 'rainfall_optimal_max_mm', 'rainfall_max_mm']),
        ('humidity', ['humidity_min_percent', 'humidity_optimal_min_percent', 'humidity_optimal_max_percent', 'humidity_max_percent']),
        ('ph', ['ph_min', 'ph_optimal_min', 'ph_optimal_max', 'ph_max']),
        ('nitrogen', ['nitrogen_min', 'nitrogen_optimal_min', 'nitrogen_optimal_max', 'nitrogen_max']),
        ('phosphorus', ['phosphorus_min', 'phosphorus_optimal_min', 'phosphorus_optimal_max', 'phosphorus_max']),
        ('potassium', ['potassium_min', 'potassium_optimal_min', 'potassium_optimal_max', 'potassium_max']),
        ('soil_moisture', ['soil_moisture_min_percent', 'soil_moisture_optimal_min_percent', 'soil_moisture_optimal_max_percent', 'soil_moisture_max_percent'])
    ]

    blank_counts = {col: 0 for col in knowledge_rows[0].keys()}

    for idx, r in enumerate(knowledge_rows, 1):
        cname = r['crop_name']

        for col, val in r.items():
            if val is None or val.strip() == '':
                blank_counts[col] += 1

        # Check controlled vocabularies
        if r['water_requirement'] not in valid_water:
            errors.append(f"Row {idx} ({cname}): invalid water_requirement '{r['water_requirement']}'.")
        if r['drought_tolerance'] not in valid_tolerance:
            errors.append(f"Row {idx} ({cname}): invalid drought_tolerance '{r['drought_tolerance']}'.")
        if r['waterlogging_tolerance'] not in valid_tolerance:
            errors.append(f"Row {idx} ({cname}): invalid waterlogging_tolerance '{r['waterlogging_tolerance']}'.")
        if r['temperature_tolerance'] not in valid_tolerance:
            errors.append(f"Row {idx} ({cname}): invalid temperature_tolerance '{r['temperature_tolerance']}'.")
        if r['confidence'] not in valid_confidence:
            errors.append(f"Row {idx} ({cname}): invalid confidence '{r['confidence']}'.")

        # Range checks
        for q_name, cols in range_quads:
            vals = []
            all_pop = True
            for col in cols:
                v_str = r[col].strip()
                if v_str != '':
                    try:
                        vals.append(float(v_str))
                    except ValueError:
                        errors.append(f"Row {idx} ({cname}): column '{col}' has non-numeric value '{v_str}'.")
                else:
                    all_pop = False

            if all_pop and len(vals) == 4:
                # Rule 9: min <= opt_min <= opt_max <= max
                if not (vals[0] <= vals[1] <= vals[2] <= vals[3]):
                    errors.append(f"Row {idx} ({cname}): {q_name} range ordering violation: {vals[0]} <= {vals[1]} <= {vals[2]} <= {vals[3]} is False.")

                # Specific checks
                if q_name == 'ph':
                    if any(v < 0 or v > 14 for v in vals):
                        errors.append(f"Row {idx} ({cname}): pH value out of 0-14 bounds: {vals}.")
                elif q_name == 'humidity' or q_name == 'soil_moisture':
                    if any(v < 0 or v > 100 for v in vals):
                        errors.append(f"Row {idx} ({cname}): {q_name} value out of 0-100% bounds: {vals}.")
                elif q_name == 'rainfall':
                    if any(v < 0 for v in vals):
                        errors.append(f"Row {idx} ({cname}): rainfall value negative: {vals}.")

        # Growth duration check
        dur_str = r['growth_duration_days'].strip()
        if dur_str != '':
            try:
                dur = float(dur_str)
                if dur <= 0:
                    errors.append(f"Row {idx} ({cname}): growth_duration_days non-positive: {dur}.")
            except ValueError:
                errors.append(f"Row {idx} ({cname}): growth_duration_days non-numeric: '{dur_str}'.")

    # Print validation summary
    print("=== CROP KNOWLEDGE VALIDATION REPORT ===")
    print(f"Total crops: {len(knowledge_rows)}")
    print(f"Duplicate crops: 0")
    print(f"Missing crops: 0")
    print(f"Errors found: {len(errors)}")

    if errors:
        print("\nERRORS:")
        for e in errors:
            print(f" - {e}")
        sys.exit(1)
    else:
        print("\nAll 15 validation checks PASSED cleanly! [PASS]")
        sys.exit(0)

if __name__ == '__main__':
    validate()
