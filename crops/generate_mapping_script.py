"""
generate_mapping_script.py
--------------------------
Writes build_mapping.py then executes it.
"""
import os, csv, sys

BASE = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# STEP 1: Collect all source crops
# ============================================================
SOURCE_FILES = {
    "Crop_Calendar_Validated.csv": "Crop",
    "combined_output.csv": "label",
    "merged_crop_dataset.csv": "label",
    "fertilizer_merged.csv": "Crop",
}

all_crops: dict[str, set[str]] = {}

for fname, col in SOURCE_FILES.items():
    path = os.path.join(BASE, fname)
    try:
        with open(path, "r", encoding="utf-8-sig", errors="replace") as f:
            for row in csv.DictReader(f):
                v = (row.get(col) or "").strip()
                if v:
                    all_crops.setdefault(v, set()).add(fname)
    except FileNotFoundError:
        print(f"WARNING: {fname} not found")

# ============================================================
# STEP 2: MAPPING TABLE
# ============================================================
# (normalized, fh_name, category, status, confidence, reason)
MAPPING: dict[str, tuple] = {}

def add(d):
    MAPPING.update(d)

# ---- CEREALS - Wheat ----
add({
    "Wheat": ("Wheat","Wheat","Cereals","Exact","High","Exact match to FarmHelper crop name."),
    "WHEAT": ("Wheat","Wheat","Cereals","Variant","High","All-caps formatting variant of Wheat."),
    "wheat": ("Wheat","Wheat","Cereals","Variant","High","Lowercase formatting variant of Wheat."),
    "Wheat (Irri.)": ("Wheat","Wheat","Cereals","Variant","High","Irrigated qualifier; the crop is Wheat."),
    "Wheat (Unirri.)": ("Wheat","Wheat","Cereals","Variant","High","Un-irrigated qualifier; the crop is Wheat."),
    "Wheat (irrigated)": ("Wheat","Wheat","Cereals","Variant","High","Irrigated qualifier; the crop is Wheat."),
    "Wheat (un irrigated)": ("Wheat","Wheat","Cereals","Variant","High","Un-irrigated qualifier; the crop is Wheat."),
    "Wheat Irrigated": ("Wheat","Wheat","Cereals","Variant","High","Irrigated qualifier; the crop is Wheat."),
    "Wheat Rain fed": ("Wheat","Wheat","Cereals","Variant","High","Rainfed qualifier; the crop is Wheat."),
    "Wheat (Gehun)": ("Wheat","Wheat","Cereals","Alias","High","Gehun is the Hindi name for Wheat."),
})

# ---- CEREALS - Rice/Paddy ----
add({
    "Rice": ("Rice","Rice","Cereals","Exact","High","Exact match to FarmHelper crop name."),
    "rice": ("Rice","Rice","Cereals","Variant","High","Lowercase formatting variant of Rice."),
    "Paddy": ("Rice","Rice","Cereals","Alias","High","Paddy is the standard agricultural term for the rice crop (unhusked)."),
    "PADDY": ("Rice","Rice","Cereals","Alias","High","All-caps form of Paddy; paddy = rice crop."),
    "Paddy (Chaiti) Rainfed": ("Rice","Rice","Cereals","Variant","High","Chaiti is a variety/season tag; the crop is Rice (Paddy)."),
    "Paddy (Irrigated) Early & medium Transplanting": ("Rice","Rice","Cereals","Variant","High","Irrigation + transplanting qualifier; the crop is Rice (Paddy)."),
    "Paddy (Jethi) Rainfed": ("Rice","Rice","Cereals","Variant","High","Jethi is a local season descriptor; the crop is Rice (Paddy)."),
    "Paddy (Nursery sowing)": ("Rice","Rice","Cereals","Variant","High","Nursery sowing stage; the crop is Rice (Paddy)."),
    "Paddy (Rabi/Summer)": ("Rice","Rice","Cereals","Variant","High","Season qualifier; the crop is Rice (Paddy)."),
    "Paddy (Spring upland)": ("Rice","Rice","Cereals","Variant","High","Season qualifier; the crop is Rice (Paddy)."),
    "Paddy (Transplanted)": ("Rice","Rice","Cereals","Variant","High","Transplanting method qualifier; the crop is Rice (Paddy)."),
    "Paddy (irrainfed)": ("Rice","Rice","Cereals","Variant","High","Irrigation qualifier; the crop is Rice (Paddy)."),
    "Paddy (rainfed)": ("Rice","Rice","Cereals","Variant","High","Rainfed qualifier; the crop is Rice (Paddy)."),
    "Summer Paddy": ("Rice","Rice","Cereals","Variant","High","Summer season rice; the crop is Rice."),
    "Zaid Paddy": ("Rice","Rice","Cereals","Variant","High","Zaid season rice; the crop is Rice."),
})

# ---- CEREALS - Maize ----
add({
    "Maize": ("Maize","Maize","Cereals","Exact","High","Exact match to FarmHelper crop name."),
    "MAIZE": ("Maize","Maize","Cereals","Variant","High","All-caps formatting variant of Maize."),
    "maize": ("Maize","Maize","Cereals","Variant","High","Lowercase formatting variant of Maize."),
    "Maize (Corn)": ("Maize","Maize","Cereals","Alias","High","Corn is the North American name for Maize; same crop."),
    "Maize (Rabi)": ("Maize","Maize","Cereals","Variant","High","Rabi season qualifier; the crop is Maize."),
    "Rabi Maize": ("Maize","Maize","Cereals","Variant","High","Rabi season qualifier; the crop is Maize."),
    "Maize (Fodder)": ("Maize (Fodder)","Unsupported","Unsupported","Unsupported","High","Fodder maize grown for animal feed, not grain. Not supported by FarmHelper Crop Advisor."),
})

# ---- CEREALS - Barley ----
add({
    "Barley": ("Barley","Barley","Cereals","Exact","High","Exact match to FarmHelper crop name."),
    "BARLEY": ("Barley","Barley","Cereals","Variant","High","All-caps formatting variant of Barley."),
    "barley": ("Barley","Barley","Cereals","Variant","High","Lowercase formatting variant of Barley."),
    "Barley (Jau)": ("Barley","Barley","Cereals","Alias","High","Jau is the Hindi name for Barley."),
    "Barley(JAV)": ("Barley","Barley","Cereals","Alias","High","JAV is an abbreviation/transliteration of Jav/Jau (Hindi: Barley)."),
})

# ---- CEREALS - Pearl Millet ----
add({
    "Bajra": ("Pearl Millet","Pearl Millet","Cereals","Alias","High","Bajra is the Indian common name for Pearl Millet."),
    "BAJRA": ("Pearl Millet","Pearl Millet","Cereals","Alias","High","All-caps form of Bajra; Bajra = Pearl Millet."),
    "Bajara": ("Pearl Millet","Pearl Millet","Cereals","Alias","High","Bajara is a common spelling variant of Bajra (Pearl Millet)."),
    "P. millet": ("Pearl Millet","Pearl Millet","Cereals","Alias","High","P. millet is an abbreviation for Pearl Millet."),
    "Pearl millet": ("Pearl Millet","Pearl Millet","Cereals","Variant","High","Capitalization variant of Pearl Millet."),
    "Pearlmillet": ("Pearl Millet","Pearl Millet","Cereals","Variant","High","Spelling variant (no space) of Pearl Millet."),
    "Kharif Bajri": ("Pearl Millet","Pearl Millet","Cereals","Alias","High","Bajri is a regional name for Pearl Millet; Kharif is the season."),
    "Summer Bajri": ("Pearl Millet","Pearl Millet","Cereals","Alias","High","Bajri = Pearl Millet; Summer is the season qualifier."),
    "Fodder Pearlmillet": ("Fodder Pearl Millet","Unsupported","Unsupported","Unsupported","High","Fodder pearl millet grown for animal feed. Not supported by FarmHelper."),
})

# ---- CEREALS - Finger Millet ----
add({
    "Ragi": ("Finger Millet","Finger Millet","Cereals","Alias","High","Ragi is the Indian common name for Finger Millet."),
    "ragi": ("Finger Millet","Finger Millet","Cereals","Alias","High","Lowercase form of Ragi; Ragi = Finger Millet."),
    "Ragi (Finger Millet)": ("Finger Millet","Finger Millet","Cereals","Alias","High","Explicit parenthetical confirms: Ragi = Finger Millet."),
    "Ragi( naachnnii)": ("Finger Millet","Finger Millet","Cereals","Alias","High","Naachni is a regional name for Ragi/Finger Millet."),
    "Mandua": ("Finger Millet","Finger Millet","Cereals","Alias","High","Mandua is a North Indian name for Finger Millet (Ragi)."),
    "Nagli": ("Finger Millet","Finger Millet","Cereals","Alias","High","Nagli is a regional name for Finger Millet used in Maharashtra."),
})

# ---- CEREALS - Sorghum ----
add({
    "Jowar": ("Sorghum","Sorghum","Cereals","Alias","High","Jowar is the Indian name for Sorghum."),
    "JOWAR": ("Sorghum","Sorghum","Cereals","Alias","High","All-caps form of Jowar; Jowar = Sorghum."),
    "Jowar (Sorghum)": ("Sorghum","Sorghum","Cereals","Alias","High","Explicit parenthetical confirms: Jowar = Sorghum."),
    "Jowar(Sorghum)": ("Sorghum","Sorghum","Cereals","Alias","High","Parenthetical confirms: Jowar = Sorghum."),
    "Juvar": ("Sorghum","Sorghum","Cereals","Alias","High","Juvar is a Gujarati/regional variant name for Sorghum (Jowar)."),
    "Sorghum": ("Sorghum","Sorghum","Cereals","Exact","High","Exact match to FarmHelper crop name."),
    "sorghum": ("Sorghum","Sorghum","Cereals","Variant","High","Lowercase formatting variant of Sorghum."),
    "Fodder sorghum": ("Fodder Sorghum","Unsupported","Unsupported","Unsupported","High","Fodder sorghum grown for animal feed. Not supported by FarmHelper."),
})

# ---- CEREALS - Minor Millets / Unsupported ----
add({
    "Foxtail Millet": ("Foxtail Millet","Unsupported","Unsupported","Unsupported","High","Foxtail Millet is a distinct millet species not currently supported by FarmHelper."),
    "Chena Sawan": ("Proso Millet","Unsupported","Unsupported","Unsupported","High","Chena Sawan refers to Proso Millet, a distinct millet not supported by FarmHelper."),
    "Sawa": ("Barnyard Millet","Unsupported","Unsupported","Uncertain","Medium","Sawa/Sava may refer to Barnyard Millet (Echinochloa spp.), not supported by FarmHelper."),
    "Sava": ("Barnyard Millet","Unsupported","Unsupported","Uncertain","Medium","Sava may refer to Barnyard Millet, not supported by FarmHelper."),
    "Sawan": ("Barnyard Millet","Unsupported","Unsupported","Uncertain","Medium","Sawan may refer to a barnyard/minor millet; not clearly identifiable."),
    "KODOKUTKI": ("Kodo Millet","Unsupported","Unsupported","Unsupported","High","Kodo-Kutki refers to Kodo and Little Millet, neither supported by FarmHelper."),
    "Kudrum": ("Kodo Millet","Unsupported","Unsupported","Uncertain","Low","Kudrum may refer to Kodo Millet; not confirmed. Not supported by FarmHelper."),
    "Bhatt": ("Soybean (Black Variety)","Unsupported","Unsupported","Uncertain","Medium","Bhatt typically refers to a black-seeded soybean variety in Uttarakhand. Marked uncertain."),
    "Oat": ("Oat","Unsupported","Unsupported","Unsupported","High","Oat is not in the current FarmHelper supported crop list."),
})

# ---- PULSES - Pigeon Pea ----
add({
    "Arhar": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Arhar is the Hindi/North Indian name for Pigeon Pea (Tur)."),
    "Arahar": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Arahar is a spelling variant of Arhar; both refer to Pigeon Pea."),
    "Arhar (Long Duration)": ("Pigeon Pea","Pigeon Pea","Pulses","Variant","High","Long-duration variety tag; the crop is Pigeon Pea."),
    "Arhar (Short Duration)": ("Pigeon Pea","Pigeon Pea","Pulses","Variant","High","Short-duration variety tag; the crop is Pigeon Pea."),
    "Arhar/": ("Pigeon Pea","Pigeon Pea","Pulses","Variant","High","Truncated entry; Arhar/ is clearly Arhar (Pigeon Pea) with a trailing slash."),
    "Arhar/pigeonpea": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Compound name explicitly linking Arhar to Pigeon Pea."),
    "Tur": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Tur is another common Indian name for Pigeon Pea."),
    "TUR": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","All-caps form of Tur; Tur = Pigeon Pea."),
    "REDGRAM": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Red Gram is a common South Indian name for Pigeon Pea."),
    "Pigeonpea": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Pigeonpea (no space) is a direct variant of Pigeon Pea."),
    "Pegionpea": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Pegionpea is a misspelling of Pigeonpea (Pigeon Pea)."),
    "Pigeon Peas (Tur/Arhar)": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Explicit compound name; Tur/Arhar = Pigeon Pea."),
    "pigeon peas(Toor Dal)": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Toor Dal is the split pulse form of Pigeon Pea; same crop."),
    "pigeonpeas": ("Pigeon Pea","Pigeon Pea","Pulses","Alias","High","Plural lowercase form of Pigeonpea = Pigeon Pea."),
})

# ---- PULSES - Black Gram ----
add({
    "Black Gram": ("Black Gram","Black Gram","Pulses","Exact","High","Exact match to FarmHelper crop name."),
    "Black gram": ("Black Gram","Black Gram","Pulses","Variant","High","Capitalization variant of Black Gram."),
    "BLACKGRAM": ("Black Gram","Black Gram","Pulses","Alias","High","All-caps compound form of Black Gram."),
    "Blackgram": ("Black Gram","Black Gram","Pulses","Alias","High","No-space compound form of Black Gram."),
    "blackgram": ("Black Gram","Black Gram","Pulses","Alias","High","Lowercase no-space compound form of Black Gram."),
    "Black Gram (Urad)": ("Black Gram","Black Gram","Pulses","Alias","High","Urad is the Hindi name for Black Gram."),
    "Urad": ("Black Gram","Black Gram","Pulses","Alias","High","Urad is the standard Hindi/Indian name for Black Gram."),
    "URAD": ("Black Gram","Black Gram","Pulses","Alias","High","All-caps form of Urad; Urad = Black Gram."),
    "Urd": ("Black Gram","Black Gram","Pulses","Alias","High","Urd is an alternate spelling of Urad (Black Gram)."),
    "URD": ("Black Gram","Black Gram","Pulses","Alias","High","All-caps form of Urd/Urad; = Black Gram."),
    "Urd (Rabi)": ("Black Gram","Black Gram","Pulses","Alias","High","Rabi season qualifier; the crop is Black Gram (Urd/Urad)."),
    "Udad": ("Black Gram","Black Gram","Pulses","Alias","High","Udad is a regional spelling variant of Urad (Black Gram)."),
    "Udid": ("Black Gram","Black Gram","Pulses","Alias","High","Udid is a Marathi/regional variant of Urad (Black Gram)."),
    "Mash": ("Black Gram","Black Gram","Pulses","Alias","High","Mash is a Punjab/Pakistani name for Black Gram (Urad)."),
})

# ---- PULSES - Green Gram ----
add({
    "Green Gram": ("Green Gram","Green Gram","Pulses","Exact","High","Exact match to FarmHelper crop name."),
    "GREEN GRAM": ("Green Gram","Green Gram","Pulses","Variant","High","All-caps formatting variant of Green Gram."),
    "GREENGRAM": ("Green Gram","Green Gram","Pulses","Alias","High","No-space all-caps form of Green Gram."),
    "Greengram": ("Green Gram","Green Gram","Pulses","Alias","High","No-space form of Green Gram."),
    "Moong": ("Green Gram","Green Gram","Pulses","Alias","High","Moong is the standard Hindi name for Green Gram."),
    "MOONG": ("Green Gram","Green Gram","Pulses","Alias","High","All-caps form of Moong; Moong = Green Gram."),
    "Mung": ("Green Gram","Green Gram","Pulses","Alias","High","Mung is an alternate spelling of Moong (Green Gram)."),
    "Mung (Rabi)": ("Green Gram","Green Gram","Pulses","Alias","High","Rabi season qualifier; the crop is Green Gram (Mung/Moong)."),
    "Mungbean": ("Green Gram","Green Gram","Pulses","Alias","High","Mungbean is another name for Green Gram/Mung Bean."),
    "mungbean": ("Green Gram","Green Gram","Pulses","Alias","High","Lowercase form of Mungbean = Green Gram."),
    "Mung Bean (Green Gram/Moong)": ("Green Gram","Green Gram","Pulses","Alias","High","Compound name explicitly linking Mung Bean to Green Gram."),
    "Mung beans": ("Green Gram","Green Gram","Pulses","Alias","High","Plural form of Mung Beans = Green Gram."),
})

# ---- PULSES - Chickpea ----
add({
    "Chickpea": ("Chickpea","Chickpea","Pulses","Exact","High","Exact match to FarmHelper crop name."),
    "chickpea": ("Chickpea","Chickpea","Pulses","Variant","High","Lowercase formatting variant of Chickpea."),
    "Chickpea (Gram)": ("Chickpea","Chickpea","Pulses","Alias","High","Gram is the common Indian name for Chickpea."),
    "Chickpeas(Channa)": ("Chickpea","Chickpea","Pulses","Alias","High","Channa/Chana is the Hindi name for Chickpea."),
    "Gram": ("Chickpea","Chickpea","Pulses","Alias","High","Gram/Bengal Gram are common Indian names for Chickpea."),
    "GRAM": ("Chickpea","Chickpea","Pulses","Alias","High","All-caps form of Gram; in Indian agri. context Gram = Chickpea."),
    "BENGALGRAM": ("Chickpea","Chickpea","Pulses","Alias","High","Bengal Gram is the standard Indian name for Chickpea (desi variety)."),
})

# ---- PULSES - Lentil ----
add({
    "Lentil": ("Lentil","Lentil","Pulses","Exact","High","Exact match to FarmHelper crop name."),
    "lentil": ("Lentil","Lentil","Pulses","Variant","High","Lowercase formatting variant of Lentil."),
    "LENTIL": ("Lentil","Lentil","Pulses","Variant","High","All-caps formatting variant of Lentil."),
    "Lentil (Masoor)": ("Lentil","Lentil","Pulses","Alias","High","Masoor is the Hindi name for Lentil."),
    "Lentils(Masoor Dal)": ("Lentil","Lentil","Pulses","Alias","High","Masoor Dal is the split form of Lentil; same crop."),
    "Khesari": ("Lathyrus / Khesari","Unsupported","Unsupported","Uncertain","Medium","Khesari (Lathyrus sativus / Grass pea) is a distinct legume from Lentil. Not supported by FarmHelper."),
    "Lathyrus": ("Lathyrus / Grass Pea","Unsupported","Unsupported","Unsupported","High","Lathyrus sativus (Grass Pea / Khesari) is a distinct crop not supported by FarmHelper."),
})

# ---- PULSES - Horse Gram ----
add({
    "Horse Gram": ("Horse Gram","Horse Gram","Pulses","Exact","High","Exact match to FarmHelper crop name."),
    "HORSE GRAM": ("Horse Gram","Horse Gram","Pulses","Variant","High","All-caps formatting variant of Horse Gram."),
    "HORSEGRAM": ("Horse Gram","Horse Gram","Pulses","Alias","High","No-space form of Horse Gram."),
    "Horsegram": ("Horse Gram","Horse Gram","Pulses","Alias","High","No-space form of Horse Gram."),
    "horsegram": ("Horse Gram","Horse Gram","Pulses","Alias","High","Lowercase no-space form of Horse Gram."),
    "Horse Gram (Kulthi)": ("Horse Gram","Horse Gram","Pulses","Alias","High","Kulthi is the Hindi name for Horse Gram."),
    "Horse Gram(kulthi)": ("Horse Gram","Horse Gram","Pulses","Alias","High","Kulthi is the Hindi name for Horse Gram."),
    "KULTHI": ("Horse Gram","Horse Gram","Pulses","Alias","High","Kulthi is the Hindi name for Horse Gram."),
    "Kulthi": ("Horse Gram","Horse Gram","Pulses","Alias","High","Kulthi is the Hindi name for Horse Gram."),
    "Gahat": ("Horse Gram","Horse Gram","Pulses","Alias","High","Gahat is a Uttarakhand/Himalayan regional name for Horse Gram."),
})

# ---- PULSES - Moth Bean ----
add({
    "Moth": ("Moth Bean","Moth Bean","Pulses","Alias","High","Moth is the short Indian name for Moth Bean."),
    "Math": ("Moth Bean","Moth Bean","Pulses","Alias","High","Math is a Gujarati/regional name for Moth Bean."),
    "Mothbean": ("Moth Bean","Moth Bean","Pulses","Alias","High","No-space form of Moth Bean."),
    "mothbeans": ("Moth Bean","Moth Bean","Pulses","Alias","High","Lowercase plural form of Moth Bean."),
    "Moth Beans": ("Moth Bean","Moth Bean","Pulses","Alias","High","Plural form of Moth Bean."),
    "Moth bean(Matki)": ("Moth Bean","Moth Bean","Pulses","Alias","High","Matki is the Marathi name for Moth Bean."),
})

# ---- PULSES - Unsupported ----
add({
    "Field Pea": ("Field Pea","Unsupported","Unsupported","Unsupported","High","Field Pea is not in the current FarmHelper supported crop list."),
    "Fieldpea": ("Field Pea","Unsupported","Unsupported","Unsupported","High","Fieldpea (no-space) = Field Pea; not supported by FarmHelper."),
    "Veg Pea": ("Vegetable Pea","Unsupported","Unsupported","Unsupported","High","Vegetable pea is not in the current FarmHelper supported crop list."),
    "Pea": ("Pea","Unsupported","Unsupported","Uncertain","Medium","Pea could mean Field Pea or Garden Pea; neither is in FarmHelper's supported crop list."),
    "PEAS": ("Pea","Unsupported","Unsupported","Uncertain","Medium","Peas (plural/caps) could mean Field Pea or Garden Pea; neither supported."),
    "Peas": ("Pea","Unsupported","Unsupported","Uncertain","Medium","Peas could mean Field Pea or Garden Pea; neither in FarmHelper's list."),
    "Cow pea": ("Cowpea","Unsupported","Unsupported","Unsupported","High","Cowpea (Lobia/Chawli) is not in the current FarmHelper supported crop list."),
    "Clusterbean": ("Cluster Bean (Guar)","Unsupported","Unsupported","Unsupported","High","Cluster Bean (Guar/Guvar) is a distinct legume not supported by FarmHelper."),
    "Cluster Beans(Gavar)": ("Cluster Bean (Guar)","Unsupported","Unsupported","Unsupported","High","Cluster Bean / Gavar (Guar) is not in the FarmHelper supported crop list."),
    "Gowar": ("Cluster Bean (Guar)","Unsupported","Unsupported","Unsupported","High","Gowar/Gwar is a variant spelling of Guar (Cluster Bean); not supported."),
    "Guvar": ("Cluster Bean (Guar)","Unsupported","Unsupported","Unsupported","High","Guvar is a Gujarati name for Guar/Cluster Bean; not supported by FarmHelper."),
    "Rajmah": ("Kidney Bean (Rajma)","Unsupported","Unsupported","Unsupported","High","Rajmah/Rajma (Kidney Beans) is not in the FarmHelper supported crop list."),
    "Rajmash": ("Kidney Bean (Rajma)","Unsupported","Unsupported","Unsupported","High","Rajmash is a variant spelling of Rajmah/Rajma (Kidney Beans); not supported."),
    "Kidney Beans (Rajma)": ("Kidney Bean (Rajma)","Unsupported","Unsupported","Unsupported","High","Kidney Beans (Rajma) are not in the current FarmHelper supported crop list."),
    "Kidney beans": ("Kidney Bean (Rajma)","Unsupported","Unsupported","Unsupported","High","Kidney Beans are not in the current FarmHelper supported crop list."),
    "kidneybeans": ("Kidney Bean (Rajma)","Unsupported","Unsupported","Unsupported","High","kidneybeans (lowercase) = Kidney Beans; not in FarmHelper supported crop list."),
    "Black eyed beans( chawli)": ("Cowpea / Black-Eyed Pea","Unsupported","Unsupported","Unsupported","High","Black-eyed beans / Cowpea (Chawli/Lobia) not in FarmHelper's supported list."),
    "Lima beans(Pavta)": ("Lima Bean","Unsupported","Unsupported","Unsupported","High","Lima Bean (Pavta) is not in the current FarmHelper supported crop list."),
    "Fava beans (Papdi - Val)": ("Fava Bean","Unsupported","Unsupported","Unsupported","High","Fava Bean (Papdi/Val) is not in the FarmHelper supported crop list."),
    "French Beans(Farasbi)": ("French Beans","Unsupported","Unsupported","Unsupported","High","French Beans (Farasbi) are not in the current FarmHelper supported crop list."),
    "Bean": ("Bean (unspecified)","Unsupported","Unsupported","Uncertain","Low","Bean is too generic to map safely; could be many distinct legume species."),
    "Green Peas": ("Garden Pea","Unsupported","Unsupported","Unsupported","High","Garden/Green Peas are not in the current FarmHelper supported crop list."),
    "PULSES:": ("Pulses (generic category)","Unsupported","Unsupported","Unsupported","High","PULSES: is a broad category header, not a specific crop name."),
    "Pulses": ("Pulses (generic category)","Unsupported","Unsupported","Unsupported","High","Pulses is a broad category label, not a specific crop."),
    "Pulses:": ("Pulses (generic category)","Unsupported","Unsupported","Unsupported","High","Pulses: is a broad category header, not a specific crop name."),
})

# ---- OILSEEDS - Mustard ----
add({
    "Mustard": ("Mustard","Mustard","Oilseeds","Exact","High","Exact match to FarmHelper crop name."),
    "Mustard seeds": ("Mustard","Mustard","Oilseeds","Alias","High","Mustard seeds refers to the crop; same as Mustard."),
    "Mustard/Toria": ("Mustard","Mustard","Oilseeds","Variant","High","Toria is a variety of mustard (B. rapa); entry groups them in the source."),
    "R- SEED MUSTARD": ("Mustard","Mustard","Oilseeds","Variant","High","R-Seed Mustard refers to rapeseed-mustard; in Indian context maps to Mustard."),
    "Rape Seed & Mustard": ("Mustard","Mustard","Oilseeds","Alias","High","Rapeseed and Mustard grouped together in Indian agricultural statistics."),
    "Rape seed & Mustard": ("Mustard","Mustard","Oilseeds","Alias","High","Capitalization variant of Rape Seed & Mustard; same crop grouping."),
    "Rapeseed & Mustard": ("Mustard","Mustard","Oilseeds","Alias","High","Standard Indian crop classification groups Rapeseed with Mustard."),
    "Rapseed Mustard": ("Mustard","Mustard","Oilseeds","Alias","High","Rapseed is a misspelling of Rapeseed; maps to Mustard in Indian agri. context."),
    "Oilseed (Mustard)": ("Mustard","Mustard","Oilseeds","Alias","High","Explicit parenthetical confirms this is Mustard."),
    "Rapeseed (Sarson)": ("Mustard","Mustard","Oilseeds","Alias","High","Sarson is the Hindi name for mustard/rapeseed. In Indian datasets Sarson = Mustard."),
    "Rapeseed (Mohri)": ("Mustard","Mustard","Oilseeds","Alias","High","Mohri is a Marathi/regional name for mustard/rapeseed; maps to Mustard."),
    "rapeseed": ("Mustard","Mustard","Oilseeds","Alias","High","In Indian agricultural context, rapeseed is statistically grouped with mustard."),
    "Toria": ("Mustard","Mustard","Oilseeds","Variant","Medium","Toria (Brassica rapa var. toria) is an Indian mustard variety under the Mustard crop group."),
    "Taramira": ("Taramira","Unsupported","Unsupported","Unsupported","High","Taramira (Eruca sativa / Tara) is a distinct oilseed crop, not the same as Mustard."),
})

# ---- OILSEEDS - Soybean ----
add({
    "Soybean": ("Soybean","Soybean","Oilseeds","Exact","High","Exact match to FarmHelper crop name."),
    "soybean": ("Soybean","Soybean","Oilseeds","Variant","High","Lowercase formatting variant of Soybean."),
    "Soyabean": ("Soybean","Soybean","Oilseeds","Alias","High","Soyabean is the common Indian spelling of Soybean."),
    "SOYABEAN": ("Soybean","Soybean","Oilseeds","Alias","High","All-caps Indian spelling of Soybean."),
    "Soybean (Soyabean)": ("Soybean","Soybean","Oilseeds","Alias","High","Compound name confirming Soyabean = Soybean."),
    "Other Oilseeds :Soybean": ("Soybean","Soybean","Oilseeds","Variant","High","Source explicitly names Soybean as the oilseed; map to Soybean."),
    "Other Oilseeds: Soybean": ("Soybean","Soybean","Oilseeds","Variant","High","Source explicitly names Soybean; map to Soybean."),
})

# ---- OILSEEDS - Sunflower ----
add({
    "Sunflower": ("Sunflower","Sunflower","Oilseeds","Exact","High","Exact match to FarmHelper crop name."),
    "SUNFLOWER": ("Sunflower","Sunflower","Oilseeds","Variant","High","All-caps formatting variant of Sunflower."),
    "sunflower": ("Sunflower","Sunflower","Oilseeds","Variant","High","Lowercase formatting variant of Sunflower."),
    "Sunflower (Surajmukhi)": ("Sunflower","Sunflower","Oilseeds","Alias","High","Surajmukhi is the Hindi name for Sunflower."),
})

# ---- OILSEEDS - Unsupported ----
add({
    "GROUNDNUT": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Groundnut (Peanut) is not in the current FarmHelper supported crop list."),
    "Groundnut": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Groundnut (Peanut) is not in the current FarmHelper supported crop list."),
    "GROUNDNUT (Rabi/Summer)": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Groundnut with season qualifier; not in FarmHelper supported crop list."),
    "GROUNDNUT Irr": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Irrigated Groundnut; Groundnut not in FarmHelper's supported crop list."),
    "GROUNDNUT Urr": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Un-irrigated Groundnut; Groundnut not in FarmHelper's supported crop list."),
    "Ground Nut": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Ground Nut = Groundnut; not in FarmHelper's supported crop list."),
    "Ground nut": ("Groundnut","Unsupported","Unsupported","Unsupported","High","Ground nut = Groundnut; not in FarmHelper's supported crop list."),
    "Summer G'nut": ("Groundnut","Unsupported","Unsupported","Unsupported","High","G_nut = Groundnut with summer season qualifier; not in FarmHelper's list."),
    "CASTOR": ("Castor","Unsupported","Unsupported","Unsupported","High","Castor (Ricinus communis) is not in the current FarmHelper supported crop list."),
    "Castor": ("Castor","Unsupported","Unsupported","Unsupported","High","Castor is not in the current FarmHelper supported crop list."),
    "castor": ("Castor","Unsupported","Unsupported","Unsupported","High","Lowercase form of Castor; not in FarmHelper's supported crop list."),
    "Sesame": ("Sesame","Unsupported","Unsupported","Unsupported","High","Sesame (Til/Sesamum) is not in the current FarmHelper supported crop list."),
    "Sesamum": ("Sesame","Unsupported","Unsupported","Unsupported","High","Sesamum is the botanical/alternate name for Sesame; not in FarmHelper's list."),
    "SESAMUM": ("Sesame","Unsupported","Unsupported","Unsupported","High","All-caps form of Sesamum (Sesame); not in FarmHelper's supported crop list."),
    "SEASAME": ("Sesame","Unsupported","Unsupported","Unsupported","High","SEASAME is a misspelling of SESAME; not in FarmHelper's supported crop list."),
    "SESAME Irr": ("Sesame","Unsupported","Unsupported","Unsupported","High","Irrigated Sesame; Sesame not in FarmHelper's supported crop list."),
    "SESAME Urr": ("Sesame","Unsupported","Unsupported","Unsupported","High","Un-irrigated Sesame; Sesame not in FarmHelper's supported crop list."),
    "Til": ("Sesame","Unsupported","Unsupported","Unsupported","High","Til is the Hindi name for Sesame; not in FarmHelper's supported crop list."),
    "TIL": ("Sesame","Unsupported","Unsupported","Unsupported","High","All-caps form of Til (Sesame); not in FarmHelper's supported crop list."),
    "TIL/": ("Sesame","Unsupported","Unsupported","Unsupported","High","Truncated form of Til (Sesame); not in FarmHelper's supported crop list."),
    "Till": ("Sesame","Unsupported","Unsupported","Unsupported","High","Till is a variant spelling of Til (Sesame); not in FarmHelper's supported crop list."),
    "till": ("Sesame","Unsupported","Unsupported","Unsupported","High","Lowercase form of Till/Til (Sesame); not in FarmHelper's supported crop list."),
    "Til/": ("Sesame","Unsupported","Unsupported","Unsupported","High","Truncated Til (Sesame) with trailing slash; not in FarmHelper's list."),
    "sesame seed": ("Sesame","Unsupported","Unsupported","Unsupported","High","Sesame seed refers to the crop Sesame; not in FarmHelper's supported crop list."),
    "SAFFLOWER": ("Safflower","Unsupported","Unsupported","Unsupported","High","Safflower is not in the current FarmHelper supported crop list."),
    "LINSEED": ("Linseed","Unsupported","Unsupported","Unsupported","High","Linseed/Flaxseed is not in the current FarmHelper supported crop list."),
    "Linseed": ("Linseed","Unsupported","Unsupported","Unsupported","High","Linseed is not in the current FarmHelper supported crop list."),
    "Linseed Rabi": ("Linseed","Unsupported","Unsupported","Unsupported","High","Rabi Linseed; Linseed not in FarmHelper's supported crop list."),
    "NIGER SEED": ("Niger Seed","Unsupported","Unsupported","Unsupported","High","Niger Seed (Guizotia abyssinica) is not in the FarmHelper supported crop list."),
    "Niger": ("Niger Seed","Unsupported","Unsupported","Unsupported","High","Niger refers to Niger Seed; not in FarmHelper's supported crop list."),
    "Other Oilseeds if any NIGER": ("Niger Seed","Unsupported","Unsupported","Unsupported","High","Source identifies this as Niger Seed; not in FarmHelper's supported crop list."),
    "Other oilseed:": ("Oilseed (generic)","Unsupported","Unsupported","Unsupported","High","Generic oilseed category header; cannot map to a specific crop."),
    "OILSEEDS": ("Oilseeds (generic category)","Unsupported","Unsupported","Unsupported","High","OILSEEDS is a broad category label, not a specific crop."),
    "Oilseeds": ("Oilseeds (generic category)","Unsupported","Unsupported","Unsupported","High","Oilseeds is a broad category label, not a specific crop."),
    "Oilseeds (Til etc.)": ("Oilseeds (generic category)","Unsupported","Unsupported","Unsupported","High","Grouped oilseed category; cannot map to a single specific crop."),
    "Dilseed": ("Unknown Oilseed","Unsupported","Unsupported","Uncertain","Low","Dilseed is not a recognized standard crop name. Could be a data entry error."),
})

# ---- CASH CROPS ----
add({
    "Cotton": ("Cotton","Cotton","Cash Crops","Exact","High","Exact match to FarmHelper crop name."),
    "COTTON": ("Cotton","Cotton","Cash Crops","Variant","High","All-caps formatting variant of Cotton."),
    "cotton": ("Cotton","Cotton","Cash Crops","Variant","High","Lowercase formatting variant of Cotton."),
    "Cotton (Kapash)": ("Cotton","Cotton","Cash Crops","Alias","High","Kapas/Kapash is the Hindi name for Cotton."),
    "Irr. Cotton": ("Cotton","Cotton","Cash Crops","Variant","High","Irrigated qualifier; the crop is Cotton."),
    "Unirr. Cotton": ("Cotton","Cotton","Cash Crops","Variant","High","Un-irrigated qualifier; the crop is Cotton."),
    "Jute": ("Jute","Jute","Cash Crops","Exact","High","Exact match to FarmHelper crop name."),
    "jute": ("Jute","Jute","Cash Crops","Variant","High","Lowercase formatting variant of Jute."),
    "Mesta": ("Jute","Unsupported","Unsupported","Uncertain","Medium","Mesta (Hibiscus cannabinus/kenaf) is sometimes grouped with Jute in Indian datasets but is a botanically distinct crop."),
    "Sugarcane": ("Sugarcane","Unsupported","Unsupported","Unsupported","High","Sugarcane is not in the current FarmHelper supported crop list."),
    "SUGARCANE": ("Sugarcane","Unsupported","Unsupported","Unsupported","High","All-caps form of Sugarcane; not in FarmHelper's supported crop list."),
    "Autumn Sugarcane": ("Sugarcane","Unsupported","Unsupported","Unsupported","High","Autumn season qualifier; Sugarcane not in FarmHelper's supported crop list."),
    "Spring Sugarcane": ("Sugarcane","Unsupported","Unsupported","Unsupported","High","Spring season qualifier; Sugarcane not in FarmHelper's supported crop list."),
    "Summer Sugarcane": ("Sugarcane","Unsupported","Unsupported","Unsupported","High","Summer season qualifier; Sugarcane not in FarmHelper's supported crop list."),
    "Tobacco": ("Tobacco","Unsupported","Unsupported","Unsupported","High","Tobacco is not in the current FarmHelper supported crop list."),
    "Tobacoo": ("Tobacco","Unsupported","Unsupported","Unsupported","High","Tobacoo is a misspelling of Tobacco; not in FarmHelper's supported crop list."),
    "Opium": ("Opium Poppy","Unsupported","Unsupported","Unsupported","High","Opium Poppy is not in the current FarmHelper supported crop list."),
})

# ---- VEGETABLES - Supported ----
add({
    "Tomato": ("Tomato","Tomato","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "tomato": ("Tomato","Tomato","Vegetables","Variant","High","Lowercase formatting variant of Tomato."),
    "Tomato (Tamatar)": ("Tomato","Tomato","Vegetables","Alias","High","Tamatar is the Hindi name for Tomato."),
    "Potato": ("Potato","Potato","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "potato": ("Potato","Potato","Vegetables","Variant","High","Lowercase formatting variant of Potato."),
    "Potato (Aloo)": ("Potato","Potato","Vegetables","Alias","High","Aloo is the Hindi name for Potato."),
    "Onion": ("Onion","Onion","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "onion": ("Onion","Onion","Vegetables","Variant","High","Lowercase formatting variant of Onion."),
    "Onion (Pyaaz)": ("Onion","Onion","Vegetables","Alias","High","Pyaaz is the Hindi name for Onion."),
    "Onian": ("Onion","Onion","Vegetables","Variant","High","Onian is a misspelling of Onion."),
    "Garlic": ("Garlic","Garlic","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "garlic": ("Garlic","Garlic","Vegetables","Variant","High","Lowercase formatting variant of Garlic."),
    "Garlic (Lehsun)": ("Garlic","Garlic","Vegetables","Alias","High","Lehsun is the Hindi name for Garlic."),
    "Cauliflower": ("Cauliflower","Cauliflower","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "cauliflower": ("Cauliflower","Cauliflower","Vegetables","Variant","High","Lowercase formatting variant of Cauliflower."),
    "Cauliflower (Phool Gobi)": ("Cauliflower","Cauliflower","Vegetables","Alias","High","Phool Gobi is the Hindi name for Cauliflower."),
    "Cabbage": ("Cabbage","Cabbage","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "cabbage": ("Cabbage","Cabbage","Vegetables","Variant","High","Lowercase formatting variant of Cabbage."),
    "Cabbage (Band Gobi)": ("Cabbage","Cabbage","Vegetables","Alias","High","Band Gobi is the Hindi name for Cabbage."),
    "Brinjal": ("Brinjal","Brinjal","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "brinjal": ("Brinjal","Brinjal","Vegetables","Variant","High","Lowercase formatting variant of Brinjal."),
    "Brinjal (Eggplant/Baingan)": ("Brinjal","Brinjal","Vegetables","Alias","High","Eggplant/Baingan are alternate names for Brinjal."),
    "Okra": ("Okra","Okra","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "okra": ("Okra","Okra","Vegetables","Variant","High","Lowercase formatting variant of Okra."),
    "Bhindi (Okra)": ("Okra","Okra","Vegetables","Alias","High","Bhindi is the Hindi name for Okra."),
    "Lady Finger": ("Okra","Okra","Vegetables","Alias","High","Lady Finger is a common Indian English name for Okra."),
    "Lady Finger (Okra/Bhindi)": ("Okra","Okra","Vegetables","Alias","High","Explicit parenthetical confirms Lady Finger = Okra/Bhindi."),
    "Radish": ("Radish","Radish","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "radish": ("Radish","Radish","Vegetables","Variant","High","Lowercase formatting variant of Radish."),
    "Radish (Mooli)": ("Radish","Radish","Vegetables","Alias","High","Mooli is the Hindi name for Radish."),
    "Carrot": ("Carrot","Carrot","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "Cucumber": ("Cucumber","Cucumber","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "cucumber": ("Cucumber","Cucumber","Vegetables","Variant","High","Lowercase formatting variant of Cucumber."),
    "Cucumber (Kheera)": ("Cucumber","Cucumber","Vegetables","Alias","High","Kheera is the Hindi name for Cucumber."),
    "Bitter Gourd": ("Bitter Gourd","Bitter Gourd","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "bitter_gourd": ("Bitter Gourd","Bitter Gourd","Vegetables","Alias","High","Underscore-separated lowercase form of Bitter Gourd."),
    "Bitter Gourd (Karela)": ("Bitter Gourd","Bitter Gourd","Vegetables","Alias","High","Karela is the Hindi name for Bitter Gourd."),
    "Bottle Gourd": ("Bottle Gourd","Bottle Gourd","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "bottle_gourd": ("Bottle Gourd","Bottle Gourd","Vegetables","Alias","High","Underscore-separated lowercase form of Bottle Gourd."),
    "Bottle Gourd (Lauki)": ("Bottle Gourd","Bottle Gourd","Vegetables","Alias","High","Lauki is the Hindi name for Bottle Gourd."),
    "Pumpkin": ("Pumpkin","Pumpkin","Vegetables","Exact","High","Exact match to FarmHelper crop name."),
    "pumpkin": ("Pumpkin","Pumpkin","Vegetables","Variant","High","Lowercase formatting variant of Pumpkin."),
    "Pumpkin (Kaddu)": ("Pumpkin","Pumpkin","Vegetables","Alias","High","Kaddu is the Hindi name for Pumpkin."),
    "Ridgegourd": ("Ridge Gourd","Ridge Gourd","Vegetables","Alias","High","No-space form of Ridge Gourd."),
    "Drumstick (Moringa/Sahjan)": ("Drumstick","Drumstick","Vegetables","Alias","High","Moringa/Sahjan are alternate names; the crop is Drumstick."),
    "drumstick": ("Drumstick","Drumstick","Vegetables","Variant","High","Lowercase formatting variant of Drumstick."),
    "Drumstick \u2013 moringa": ("Drumstick","Drumstick","Vegetables","Alias","High","En-dash encoding artifact in Drumstick–moringa; same crop as Drumstick (Moringa)."),
})

# ---- VEGETABLES - Unsupported ----
add({
    "Capsicum": ("Capsicum (Bell Pepper)","Unsupported","Unsupported","Unsupported","High","Capsicum/Bell Pepper is not in the current FarmHelper supported crop list."),
    "Chilli": ("Chilli","Unsupported","Unsupported","Unsupported","High","Green/Red Chilli is not in the current FarmHelper supported crop list."),
    "Chili": ("Chilli","Unsupported","Unsupported","Unsupported","High","Chili (alternate spelling) is not in the FarmHelper supported crop list."),
    "Beetroot": ("Beetroot","Unsupported","Unsupported","Unsupported","High","Beetroot is not in the current FarmHelper supported crop list."),
    "Spinach": ("Spinach","Unsupported","Unsupported","Unsupported","High","Spinach is not in the current FarmHelper supported crop list."),
    "Sweet Potato": ("Sweet Potato","Unsupported","Unsupported","Unsupported","High","Sweet Potato is distinct from Potato; not in FarmHelper's crop list."),
    "Sweet Potato (Shakarkandi)": ("Sweet Potato","Unsupported","Unsupported","Unsupported","High","Sweet Potato (Shakarkandi) is distinct from Potato; not in FarmHelper's list."),
    "sweet_potato": ("Sweet Potato","Unsupported","Unsupported","Unsupported","High","sweet_potato = Sweet Potato; distinct from Potato; not in FarmHelper's list."),
    "Ash Gourd": ("Ash Gourd","Unsupported","Unsupported","Unsupported","High","Ash Gourd (Winter Melon) is not in the current FarmHelper supported crop list."),
    "Vegetables": ("Vegetables (generic category)","Unsupported","Unsupported","Unsupported","High","Vegetables is a broad category label, not a specific crop."),
    "Amaranths": ("Amaranth","Unsupported","Unsupported","Unsupported","High","Amaranth (grain/leaf) is not in the current FarmHelper supported crop list."),
    "Ramdana": ("Amaranth (Grain)","Unsupported","Unsupported","Unsupported","High","Ramdana is the Hindi name for Grain Amaranth; not in FarmHelper's list."),
    "Rajgaras": ("Amaranth (Grain)","Unsupported","Unsupported","Unsupported","High","Rajgaras/Rajgira is the Hindi name for Grain Amaranth; not in FarmHelper's list."),
    "Rajgro": ("Amaranth (Grain)","Unsupported","Unsupported","Unsupported","High","Rajgro appears to be a variant/misspelling of Rajgira (Amaranth); not supported."),
    "Tapioca(Suran)": ("Tapioca / Elephant Yam","Unsupported","Unsupported","Uncertain","Low","Tapioca (Cassava) and Suran (Elephant Yam) are different crops. The grouping is unclear."),
    "Mushroom": ("Mushroom","Unsupported","Unsupported","Unsupported","High","Mushroom is a fungus, not a crop; not in FarmHelper's supported crop list."),
})

# ---- FRUITS - Supported ----
add({
    "Mango": ("Mango","Mango","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "mango": ("Mango","Mango","Fruits","Variant","High","Lowercase formatting variant of Mango."),
    "Banana": ("Banana","Banana","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "banana": ("Banana","Banana","Fruits","Variant","High","Lowercase formatting variant of Banana."),
    "Apple": ("Apple","Apple","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "apple": ("Apple","Apple","Fruits","Variant","High","Lowercase formatting variant of Apple."),
    "Coconut": ("Coconut","Coconut","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "coconut": ("Coconut","Coconut","Fruits","Variant","High","Lowercase formatting variant of Coconut."),
    "Coconut (Nariyal)": ("Coconut","Coconut","Fruits","Alias","High","Nariyal is the Hindi name for Coconut."),
    "Grapes": ("Grapes","Grapes","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "grapes": ("Grapes","Grapes","Fruits","Variant","High","Lowercase formatting variant of Grapes."),
    "Jackfruit": ("Jackfruit","Jackfruit","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "jackfruit": ("Jackfruit","Jackfruit","Fruits","Variant","High","Lowercase formatting variant of Jackfruit."),
    "Jackfruit (Kathal)": ("Jackfruit","Jackfruit","Fruits","Alias","High","Kathal is the Hindi name for Jackfruit."),
    "Muskmelon": ("Muskmelon","Muskmelon","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "muskmelon": ("Muskmelon","Muskmelon","Fruits","Variant","High","Lowercase formatting variant of Muskmelon."),
    "Musk Melon": ("Muskmelon","Muskmelon","Fruits","Variant","High","Two-word spacing variant of Muskmelon."),
    "Muskmelon (Kharbuja)": ("Muskmelon","Muskmelon","Fruits","Alias","High","Kharbuja is the Hindi name for Muskmelon."),
    "Orange": ("Orange/Mandarin","Orange/Mandarin","Fruits","Alias","High","Orange is the common English name; maps to FarmHelper's Orange/Mandarin."),
    "orange": ("Orange/Mandarin","Orange/Mandarin","Fruits","Alias","High","Lowercase form of Orange; maps to FarmHelper's Orange/Mandarin."),
    "Orange (Santra)": ("Orange/Mandarin","Orange/Mandarin","Fruits","Alias","High","Santra is the Hindi name for Orange; maps to FarmHelper's Orange/Mandarin."),
    "Papaya": ("Papaya","Papaya","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "papaya": ("Papaya","Papaya","Fruits","Variant","High","Lowercase formatting variant of Papaya."),
    "Pomegranate": ("Pomegranate","Pomegranate","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "pomegranate": ("Pomegranate","Pomegranate","Fruits","Variant","High","Lowercase formatting variant of Pomegranate."),
    "Watermelon": ("Watermelon","Watermelon","Fruits","Exact","High","Exact match to FarmHelper crop name."),
    "watermelon": ("Watermelon","Watermelon","Fruits","Variant","High","Lowercase formatting variant of Watermelon."),
    "Water Melon": ("Watermelon","Watermelon","Fruits","Variant","High","Two-word spacing variant of Watermelon."),
})

# ---- FRUITS - Unsupported ----
add({
    "Pineapple (Ananas)": ("Pineapple","Unsupported","Unsupported","Unsupported","High","Pineapple is not in the current FarmHelper supported crop list."),
    "Pineapple": ("Pineapple","Unsupported","Unsupported","Unsupported","High","Pineapple is not in the current FarmHelper supported crop list."),
    "pineapple": ("Pineapple","Unsupported","Unsupported","Unsupported","High","Lowercase form of Pineapple; not in FarmHelper's supported crop list."),
    "Guava": ("Guava","Unsupported","Unsupported","Unsupported","High","Guava is not in the current FarmHelper supported crop list."),
    "Cashewnuts": ("Cashew","Unsupported","Unsupported","Unsupported","High","Cashew is not in the current FarmHelper supported crop list."),
    "Chickoo": ("Chickoo (Sapodilla)","Unsupported","Unsupported","Unsupported","High","Chickoo (Sapodilla / Chiku) is not in the FarmHelper supported crop list."),
    "Custard apple": ("Custard Apple","Unsupported","Unsupported","Unsupported","High","Custard Apple (Sitaphal) is not in FarmHelper's supported crop list."),
    "Dates": ("Dates","Unsupported","Unsupported","Unsupported","High","Dates (Phoenix dactylifera) are not in the current FarmHelper supported crop list."),
    "Figs": ("Figs","Unsupported","Unsupported","Unsupported","High","Figs are not in the current FarmHelper supported crop list."),
    "Jambun(Syzygium cumini)": ("Java Plum (Jamun)","Unsupported","Unsupported","Unsupported","High","Jamun/Java Plum is not in the current FarmHelper supported crop list."),
    "Gooseberry(Amla)": ("Amla (Indian Gooseberry)","Unsupported","Unsupported","Unsupported","High","Amla (Indian Gooseberry) is not in the current FarmHelper supported crop list."),
    "Lemon": ("Lemon","Unsupported","Unsupported","Unsupported","High","Lemon is not in the current FarmHelper supported crop list."),
    "Apricot": ("Apricot","Unsupported","Unsupported","Unsupported","High","Apricot is not in the current FarmHelper supported crop list."),
    "Almond Nut": ("Almond","Unsupported","Unsupported","Unsupported","High","Almond is not in the current FarmHelper supported crop list."),
    "Pistachio Nut": ("Pistachio","Unsupported","Unsupported","Unsupported","High","Pistachio is not in the current FarmHelper supported crop list."),
    "Raisins": ("Raisins (dried grapes)","Unsupported","Unsupported","Unsupported","High","Raisins are a processed product of Grapes, not the crop itself."),
    "Ziziphus mauritiana(Bor)": ("Ber (Indian Jujube)","Unsupported","Unsupported","Unsupported","High","Ber (Indian Jujube) is not in the current FarmHelper supported crop list."),
    "Garcinia indica(kokam)": ("Kokam","Unsupported","Unsupported","Unsupported","High","Kokam (Garcinia indica) is not in the current FarmHelper supported crop list."),
    "Tamarind": ("Tamarind","Unsupported","Unsupported","Unsupported","High","Tamarind is not in the current FarmHelper supported crop list."),
    "Arecanut": ("Areca Nut (Betel Nut)","Unsupported","Unsupported","Unsupported","High","Areca Nut is not in the current FarmHelper supported crop list."),
    "Olive": ("Olive","Unsupported","Unsupported","Unsupported","High","Olive is not in the current FarmHelper supported crop list."),
    "Jaiphal(Nutmeg)": ("Nutmeg","Unsupported","Unsupported","Unsupported","High","Nutmeg is not in the current FarmHelper supported crop list."),
})

# ---- SPICES - Supported ----
add({
    "Turmeric": ("Turmeric","Turmeric","Spices","Exact","High","Exact match to FarmHelper crop name."),
    "turmeric": ("Turmeric","Turmeric","Spices","Variant","High","Lowercase formatting variant of Turmeric."),
    "Turmeric (Haldi)": ("Turmeric","Turmeric","Spices","Alias","High","Haldi is the Hindi name for Turmeric."),
    "Coriander": ("Coriander","Coriander","Spices","Exact","High","Exact match to FarmHelper crop name."),
    "coriander": ("Coriander","Coriander","Spices","Variant","High","Lowercase formatting variant of Coriander."),
    "Coriander (Dhania)": ("Coriander","Coriander","Spices","Alias","High","Dhania is the Hindi name for Coriander."),
    "Coriander seeds": ("Coriander","Coriander","Spices","Alias","High","Coriander seeds refers to the crop Coriander."),
    "Coriander leaves": ("Coriander","Coriander","Spices","Alias","High","Coriander leaves are a use of the same Coriander plant."),
    "Coriender": ("Coriander","Coriander","Spices","Variant","High","Coriender is a misspelling of Coriander."),
    "coriender": ("Coriander","Coriander","Spices","Variant","High","coriender is a lowercase misspelling of Coriander."),
    "Black Pepper": ("Black Pepper","Black Pepper","Spices","Exact","High","Exact match to FarmHelper crop name."),
    "blackpepper": ("Black Pepper","Black Pepper","Spices","Alias","High","No-space lowercase form of Black Pepper."),
    "Black Pepper (Kali Mirch)": ("Black Pepper","Black Pepper","Spices","Alias","High","Kali Mirch is the Hindi name for Black Pepper."),
    "Cardamom": ("Cardamom","Cardamom","Spices","Exact","High","Exact match to FarmHelper crop name."),
    "cardamom": ("Cardamom","Cardamom","Spices","Variant","High","Lowercase formatting variant of Cardamom."),
    "Cardamom (Elaichi)": ("Cardamom","Cardamom","Spices","Alias","High","Elaichi is the Hindi name for Cardamom."),
})

# ---- SPICES - Unsupported ----
add({
    "Ginger": ("Ginger","Unsupported","Unsupported","Unsupported","High","Ginger is not in the current FarmHelper supported crop list."),
    "Cumin": ("Cumin","Unsupported","Unsupported","Unsupported","High","Cumin is not in the current FarmHelper supported crop list."),
    "Cumin seeds": ("Cumin","Unsupported","Unsupported","Unsupported","High","Cumin seeds refers to the Cumin crop; not in FarmHelper's supported crop list."),
    "Fennel": ("Fennel","Unsupported","Unsupported","Unsupported","High","Fennel (Saunf) is not in the current FarmHelper supported crop list."),
    "Funnel": ("Fennel","Unsupported","Unsupported","Unsupported","High","Funnel is a misspelling of Fennel (Saunf); not in FarmHelper's list."),
    "Fenugreek": ("Fenugreek","Unsupported","Unsupported","Unsupported","High","Fenugreek (Methi) is not in the current FarmHelper supported crop list."),
    "Fenugreek Leaf(methi)": ("Fenugreek","Unsupported","Unsupported","Unsupported","High","Methi/Fenugreek leaf refers to the Fenugreek crop; not in FarmHelper's list."),
    "Ajwain": ("Ajwain (Carom Seeds)","Unsupported","Unsupported","Unsupported","High","Ajwain (Trachyspermum ammi) is not in the current FarmHelper supported crop list."),
    "Aniseed": ("Aniseed","Unsupported","Unsupported","Unsupported","High","Aniseed is not in the current FarmHelper supported crop list."),
    "Cloves": ("Cloves","Unsupported","Unsupported","Unsupported","High","Cloves are not in the current FarmHelper supported crop list."),
    "Cinnamon": ("Cinnamon","Unsupported","Unsupported","Unsupported","High","Cinnamon is not in the current FarmHelper supported crop list."),
    "Bay Leaf": ("Bay Leaf","Unsupported","Unsupported","Unsupported","High","Bay Leaf is not in the current FarmHelper supported crop list."),
    "Mentha": ("Mentha (Mint)","Unsupported","Unsupported","Unsupported","High","Mentha/Mint is not in the current FarmHelper supported crop list."),
    "Lemon Grass": ("Lemon Grass","Unsupported","Unsupported","Unsupported","High","Lemon Grass is not in the current FarmHelper supported crop list."),
    "Isabgol": ("Isabgol (Psyllium)","Unsupported","Unsupported","Unsupported","High","Isabgol (Psyllium husk) is not in the current FarmHelper supported crop list."),
    "Isabgul": ("Isabgol (Psyllium)","Unsupported","Unsupported","Unsupported","High","Isabgul is a variant spelling of Isabgol (Psyllium); not in FarmHelper's list."),
    "Isbgol": ("Isabgol (Psyllium)","Unsupported","Unsupported","Unsupported","High","Isbgol is a variant spelling of Isabgol (Psyllium); not in FarmHelper's list."),
    "Curry leaves": ("Curry Leaf","Unsupported","Unsupported","Unsupported","High","Curry leaves are not in the current FarmHelper supported crop list."),
})

# ---- OTHER / MISC ----
add({
    "Coffee": ("Coffee","Unsupported","Unsupported","Unsupported","High","Coffee is not in the current FarmHelper supported crop list."),
    "coffee": ("Coffee","Unsupported","Unsupported","Unsupported","High","Lowercase form of Coffee; not in FarmHelper's supported crop list."),
    "Fodder": ("Fodder (generic)","Unsupported","Unsupported","Unsupported","High","Fodder is a use category, not a specific crop."),
    "Fodar": ("Fodder (generic)","Unsupported","Unsupported","Unsupported","High","Fodar appears to be a misspelling/variant of Fodder; not a specific crop."),
    "Fooder": ("Fodder (generic)","Unsupported","Unsupported","Unsupported","High","Fooder is a misspelling of Fodder; not a specific crop."),
    "Lucern": ("Lucerne (Alfalfa)","Unsupported","Unsupported","Unsupported","High","Lucerne (Alfalfa) is a fodder crop not in FarmHelper's supported crop list."),
    "Rabi Crop": ("Season label (Rabi)","Unsupported","Unsupported","Unsupported","High","Rabi Crop is a seasonal category label, not a specific crop."),
    "Rabi Crops": ("Season label (Rabi)","Unsupported","Unsupported","Unsupported","High","Rabi Crops is a seasonal category label, not a specific crop."),
    "Summer/Zaid Crops": ("Season label (Zaid)","Unsupported","Unsupported","Unsupported","High","Summer/Zaid Crops is a seasonal category label, not a specific crop."),
    "Other Crop- Specify": ("Unspecified Crop","Unsupported","Unsupported","Unsupported","High","Open-ended category; no specific crop identifiable."),
    "Other crop- specify": ("Unspecified Crop","Unsupported","Unsupported","Unsupported","High","Open-ended category; no specific crop identifiable."),
    "Other crop-specify": ("Unspecified Crop","Unsupported","Unsupported","Unsupported","High","Open-ended category; no specific crop identifiable."),
    "TEORA": ("Teora (Brassica variety)","Unsupported","Unsupported","Uncertain","Low","TEORA may refer to a local Brassica variety or Toria, but insufficient evidence to map safely."),
    "Chikori": ("Chicory","Unsupported","Unsupported","Unsupported","High","Chicory is not in the current FarmHelper supported crop list."),
    "China": ("Unknown","Unsupported","Unsupported","Uncertain","Low","China as a crop name is unrecognized in standard Indian agricultural datasets. Possibly a data entry error."),
    "Culacatti": ("Unknown","Unsupported","Unsupported","Uncertain","Low","Culacatti is not a recognized standard Indian crop name. Possibly a local/dialect term or data entry error."),
    "Green": ("Unknown (possibly Green Gram)","Unsupported","Unsupported","Uncertain","Low","Green alone is too ambiguous; could refer to Green Gram or green vegetables. Cannot map safely."),
    "Asafoetida": ("Asafoetida (Hing)","Unsupported","Unsupported","Unsupported","High","Asafoetida (Hing) is a spice resin, not a crop, and not in the current FarmHelper supported crop list."),
})

# ============================================================
# STEP 3: Write CSV
# ============================================================
OUT_COLS = [
    "original_crop_name",
    "normalized_crop_name",
    "farmhelper_crop_name",
    "crop_category",
    "mapping_status",
    "mapping_confidence",
    "source_files",
    "mapping_reason",
]

rows = []
unmapped = []

for orig, sources in sorted(all_crops.items()):
    src_str = "; ".join(sorted(sources))
    if orig in MAPPING:
        m = MAPPING[orig]
        rows.append({
            "original_crop_name": orig,
            "normalized_crop_name": m[0],
            "farmhelper_crop_name": m[1],
            "crop_category": m[2],
            "mapping_status": m[3],
            "mapping_confidence": m[4],
            "source_files": src_str,
            "mapping_reason": m[5],
        })
    else:
        unmapped.append(orig)
        rows.append({
            "original_crop_name": orig,
            "normalized_crop_name": orig,
            "farmhelper_crop_name": "Uncertain",
            "crop_category": "Unsupported",
            "mapping_status": "Uncertain",
            "mapping_confidence": "Low",
            "source_files": src_str,
            "mapping_reason": "No mapping defined for this crop name; requires human review.",
        })

out_path = os.path.join(BASE, "crop_mapping_final.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=OUT_COLS)
    writer.writeheader()
    writer.writerows(rows)

print(f"\ncrop_mapping_final.csv written: {len(rows)} rows")

# ============================================================
# STEP 4: Validation Report
# ============================================================
n_exact = sum(1 for r in rows if r["mapping_status"] == "Exact")
n_alias = sum(1 for r in rows if r["mapping_status"] == "Alias")
n_variant = sum(1 for r in rows if r["mapping_status"] == "Variant")
n_unsupported = sum(1 for r in rows if r["mapping_status"] == "Unsupported")
n_uncertain = sum(1 for r in rows if r["mapping_status"] == "Uncertain")

fh_names = sorted(set(
    r["farmhelper_crop_name"]
    for r in rows
    if r["farmhelper_crop_name"] not in ("Unsupported", "Uncertain")
))

VALID_FH = {
    "Barley","Basmati Rice","Finger Millet","Maize","Pearl Millet",
    "Rice","Sorghum","Wheat",
    "Black Gram","Chickpea","Green Gram","Horse Gram","Lentil",
    "Moth Bean","Pigeon Pea",
    "Mustard","Soybean","Sunflower",
    "Cotton","Jute",
    "Bitter Gourd","Bottle Gourd","Brinjal","Cabbage","Carrot",
    "Cauliflower","Cucumber","Drumstick","Garlic","Okra","Onion",
    "Potato","Pumpkin","Radish","Ridge Gourd","Tomato",
    "Apple","Banana","Coconut","Grapes","Jackfruit","Mango",
    "Muskmelon","Orange/Mandarin","Papaya","Pomegranate","Watermelon",
    "Black Pepper","Cardamom","Coriander","Turmeric",
    "Unsupported","Uncertain",
}

invalid = [r for r in rows if r["farmhelper_crop_name"] not in VALID_FH]

print("\n" + "="*60)
print("VALIDATION REPORT")
print("="*60)
print(f" 1. Total unique original crop names : {len(rows)}")
print(f" 2. Mapped Exact                      : {n_exact}")
print(f" 3. Mapped as Alias                   : {n_alias}")
print(f" 4. Mapped as Variant                 : {n_variant}")
print(f" 5. Marked Unsupported                : {n_unsupported}")
print(f" 6. Marked Uncertain                  : {n_uncertain}")
print(f" 7. FarmHelper crops represented      : {len(fh_names)}")
print(f"    {fh_names}")
print(f" 8. Unmapped entries (human review)   : {len(unmapped)}")
for u in sorted(unmapped):
    print(f"    - {u!r}")
print(f" 9. Invalid farmhelper_crop_name rows : {len(invalid)}")
for r in invalid:
    print(f"    - {r['original_crop_name']!r} -> {r['farmhelper_crop_name']!r}")
print()

# Summary of important alias groups
print("10. Key alias groups validated:")
groups = {
    "Pigeon Pea": [r["original_crop_name"] for r in rows if r["farmhelper_crop_name"]=="Pigeon Pea"],
    "Rice": [r["original_crop_name"] for r in rows if r["farmhelper_crop_name"]=="Rice"],
    "Black Gram": [r["original_crop_name"] for r in rows if r["farmhelper_crop_name"]=="Black Gram"],
    "Pearl Millet": [r["original_crop_name"] for r in rows if r["farmhelper_crop_name"]=="Pearl Millet"],
    "Mustard": [r["original_crop_name"] for r in rows if r["farmhelper_crop_name"]=="Mustard"],
    "Green Gram": [r["original_crop_name"] for r in rows if r["farmhelper_crop_name"]=="Green Gram"],
}
for crop, members in groups.items():
    print(f"    {crop} ({len(members)} entries): {members[:5]}{'...' if len(members)>5 else ''}")
