import csv
import json
import pandas as pd

master_path = 'crops/farmhelper_crop_master.csv'
merged_path = 'crops/merged_crop_dataset.csv'
fert_path = 'crops/fertilizer_merged.csv'

with open(master_path, 'r', encoding='utf-8') as f:
    master = list(csv.DictReader(f))

merged_df = pd.read_csv(merged_path)

print(f"Total Master Crops: {len(master)}")
