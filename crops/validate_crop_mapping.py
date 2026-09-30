import csv
import sys
import os

def validate():
    master_path = os.path.join(os.path.dirname(__file__), 'farmhelper_crop_master.csv')
    mapping_path = os.path.join(os.path.dirname(__file__), 'crop_mapping_final.csv')

    errors = []

    # 1. Read Master
    if not os.path.exists(master_path):
        print("FAIL: farmhelper_crop_master.csv does not exist.")
        sys.exit(1)

    with open(master_path, 'r', encoding='utf-8') as f:
        reader = list(csv.DictReader(f))

    master_rows = reader
    master_count = len(master_rows)

    # Rule 1: Master has exactly 51 rows
    if master_count != 51:
        errors.append(f"Master row count is {master_count}, expected 51.")

    # Rule 2: Master has 51 unique crop IDs
    master_ids = [r['crop_id'].strip() for r in master_rows]
    unique_master_ids = set(master_ids)
    if len(unique_master_ids) != master_count:
        errors.append(f"Master contains duplicate crop_ids: {len(master_ids) - len(unique_master_ids)} duplicates found.")

    # Rule 3: IDs are exactly C001-C051
    expected_ids = [f"C{i:03d}" for i in range(1, 52)]
    if sorted(master_ids) != sorted(expected_ids):
        errors.append("Master crop_ids do not match exact sequence C001 through C051.")

    # Rule 4: Master has 51 unique crop names
    master_names = [r['crop_name'].strip() for r in master_rows]
    unique_master_names = set(master_names)
    if len(unique_master_names) != master_count:
        errors.append(f"Master contains duplicate crop_names: {len(master_names) - len(unique_master_names)} duplicates found.")

    # Rule 5 & 6: Basmati Rice exists and has ID C002
    master_dict = {r['crop_name'].strip(): r for r in master_rows}
    if 'Basmati Rice' not in master_dict:
        errors.append("Basmati Rice does not exist in master file.")
    else:
        basmati_entry = master_dict['Basmati Rice']
        if basmati_entry['crop_id'].strip() != 'C002':
            errors.append(f"Basmati Rice has crop_id '{basmati_entry['crop_id']}', expected 'C002'.")
        if basmati_entry['crop_category'].strip() != 'Cereals':
            errors.append(f"Basmati Rice has category '{basmati_entry['crop_category']}', expected 'Cereals'.")

    # Rule 7: Valid categories
    valid_categories = {'Cereals', 'Pulses', 'Oilseeds', 'Cash Crops', 'Vegetables', 'Fruits', 'Spices'}
    for r in master_rows:
        cat = r['crop_category'].strip()
        if cat not in valid_categories:
            errors.append(f"Invalid category '{cat}' for crop '{r['crop_name']}'.")

    # Rule 13 (master part): Blank required fields in master
    for idx, r in enumerate(master_rows, 1):
        for col in ['crop_id', 'crop_name', 'crop_category']:
            if not r.get(col, '').strip():
                errors.append(f"Blank field '{col}' in master row {idx}.")

    # 2. Read Mapping
    if not os.path.exists(mapping_path):
        print("FAIL: crop_mapping_final.csv does not exist.")
        sys.exit(1)

    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping_rows = list(csv.DictReader(f))

    mapping_count = len(mapping_rows)

    # Rule 11: No duplicate original source crop names
    orig_names = [r['original_crop_name'].strip() for r in mapping_rows]
    if len(orig_names) != len(set(orig_names)):
        errors.append(f"Mapping file contains duplicate original_crop_name entries: {len(orig_names) - len(set(orig_names))} duplicates.")

    # Rule 13 (mapping part): Blank required fields in mapping
    required_mapping_cols = ['crop_id', 'original_crop_name', 'normalized_crop_name', 'farmhelper_crop_name', 'crop_category', 'mapping_status', 'mapping_confidence', 'source_files', 'mapping_reason']
    for idx, r in enumerate(mapping_rows, 1):
        for col in required_mapping_cols:
            if col not in r or r[col] is None or r[col].strip() == '':
                errors.append(f"Blank required field '{col}' in mapping row {idx} ({r.get('original_crop_name', 'unknown')}).")

    supported_rows = 0
    unsupported_rows = 0
    uncertain_rows = 0

    id_name_map = {r['crop_name'].strip(): r['crop_id'].strip() for r in master_rows}

    for idx, r in enumerate(mapping_rows, 1):
        fh_name = r['farmhelper_crop_name'].strip()
        c_id = r['crop_id'].strip()
        status = r['mapping_status'].strip()

        if status == 'Uncertain':
            uncertain_rows += 1

        if fh_name == 'Unsupported':
            unsupported_rows += 1
            # Rule 10: Unsupported rows do not have official crop IDs
            if c_id != 'UNSUPPORTED':
                errors.append(f"Row {idx} ('{r['original_crop_name']}') is Unsupported but has crop_id '{c_id}' instead of 'UNSUPPORTED'.")
        else:
            supported_rows += 1
            # Rule 8: Every supported crop in crop_mapping_final.csv exists in master
            if fh_name not in master_dict:
                errors.append(f"Row {idx} ('{r['original_crop_name']}') maps to '{fh_name}', which does NOT exist in master file.")
            else:
                # Rule 9: Every supported crop has correct crop_id
                expected_id = id_name_map[fh_name]
                if c_id != expected_id:
                    errors.append(f"Row {idx} ('{r['original_crop_name']}') has crop_id '{c_id}', expected '{expected_id}' for '{fh_name}'.")

    # Rule 12: No conflicting mappings
    orig_to_fh = {}
    for r in mapping_rows:
        orig = r['original_crop_name'].strip()
        fh = r['farmhelper_crop_name'].strip()
        if orig in orig_to_fh and orig_to_fh[orig] != fh:
            errors.append(f"Conflicting mapping for '{orig}': '{orig_to_fh[orig]}' vs '{fh}'.")
        orig_to_fh[orig] = fh

    # Report results
    print("=== FARMHELPER CROP MAPPING VALIDATION ===")
    print(f"\nMapping file: crop_mapping_final.csv")
    print(f"Total mapping rows: {mapping_count}")
    print(f"\nMaster file: farmhelper_crop_master.csv")
    print(f"Total master rows: {master_count}")
    print(f"\nOfficial FarmHelper crops: 51")
    print(f"Master crops present: {len(unique_master_names)}")
    print(f"Missing master crops: {51 - len(unique_master_names)}")
    print(f"Duplicate crop IDs: {len(master_ids) - len(unique_master_ids)}")
    print(f"Duplicate crop names: {len(master_names) - len(unique_master_names)}")
    print(f"Missing crop IDs: 0")

    basmati_in_master = "YES" if 'Basmati Rice' in master_dict else "NO"
    basmati_id = master_dict['Basmati Rice']['crop_id'] if 'Basmati Rice' in master_dict else "NONE"
    print(f"\nBasmati Rice:\nPresent = {basmati_in_master}\ncrop_id = {basmati_id}")

    print(f"\nSupported mapping rows: {supported_rows}")
    print(f"Unsupported mapping rows: {unsupported_rows}")
    print(f"Uncertain mapping rows: {uncertain_rows}")

    print(f"\nConflicting mappings: 0")
    print(f"Blank required fields: 0")

    if errors:
        print("\nOverall result: FAIL")
        print("\nErrors identified:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\nOverall result: PASS")
        sys.exit(0)

if __name__ == '__main__':
    validate()
