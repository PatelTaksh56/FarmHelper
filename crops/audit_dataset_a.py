import csv
import os
import math

filepath = 'crops/crop-wise-area-production-yield-mapped.csv'

print(f"File size: {os.path.getsize(filepath) / (1024*1024):.2f} MB")

with open(filepath, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    print(f"Header ({len(header)} columns): {header}")

    row_count = 0
    sample_rows = []
    
    states = set()
    districts = set()
    crops_raw = set()
    years = set()
    
    missing_counts = [0] * len(header)
    zero_counts = [0] * len(header)
    non_numeric_counts = [0] * len(header)
    
    # Check yield = production / area formula
    yield_match = 0
    yield_mismatch = 0
    yield_check_count = 0
    
    # Duplicate checking
    seen_keys = set()
    duplicates = 0
    conflicts = 0

    for row in reader:
        row_count += 1
        if len(sample_rows) < 5:
            sample_rows.append(row)
            
        for i, val in enumerate(row):
            val_str = val.strip()
            if not val_str or val_str.lower() in ['null', 'none', 'nan', '']:
                missing_counts[i] += 1
            else:
                try:
                    num = float(val_str)
                    if num == 0:
                        zero_counts[i] += 1
                except ValueError:
                    non_numeric_counts[i] += 1

print(f"Total Rows: {row_count}")
print("\nColumn summary:")
for i, col in enumerate(header):
    missing_pct = (missing_counts[i] / row_count) * 100
    zero_pct = (zero_counts[i] / row_count) * 100
    non_num = non_numeric_counts[i]
    print(f"  Col {i}: {col} | Missing: {missing_counts[i]} ({missing_pct:.2f}%) | Zeros: {zero_counts[i]} ({zero_pct:.2f}%) | Non-numeric: {non_num}")
