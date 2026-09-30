import csv
import json
import re

MONTH_MAP = {
    'jan': 1, 'january': 1,
    'feb': 2, 'february': 2,
    'mar': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'may': 5,
    'jun': 6, 'june': 6,
    'jul': 7, 'july': 7,
    'aug': 8, 'august': 8, 'agu': 8,
    'sep': 9, 'sept': 9, 'september': 9,
    'oct': 10, 'octo': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dec': 12, 'december': 12
}

MONTH_DAYS = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}

def parse_day_month(text):
    if not text:
        return None, None
    text_lower = text.lower().strip()
    
    # Check month
    month_found = None
    month_pos = 999
    for m_str, m_num in MONTH_MAP.items():
        pattern = r'\b' + re.escape(m_str) + r'\b'
        match = re.search(pattern, text_lower)
        if match and match.start() < month_pos:
            month_found = m_num
            month_pos = match.start()
            
    if not month_found:
        return None, None

    # Check day / week
    day_found = None
    if '1st week' in text_lower or 'first week' in text_lower or '1 st week' in text_lower or '1st' in text_lower:
        day_found = 1
    elif '2nd week' in text_lower or 'second week' in text_lower or '2 nd week' in text_lower or '2nd' in text_lower:
        day_found = 8
    elif '3rd week' in text_lower or 'third week' in text_lower or '3 rd week' in text_lower or '3rd' in text_lower:
        day_found = 15
    elif '4th week' in text_lower or 'fourth week' in text_lower or 'last week' in text_lower or '4th' in text_lower:
        day_found = 22
    elif 'mid' in text_lower:
        day_found = 15

    if day_found is None:
        nums = re.findall(r'\b\d{1,2}\b', text_lower)
        if nums:
            for n in nums:
                val = int(n)
                if 1 <= val <= 31:
                    day_found = val
                    break

    return day_found, month_found

def parse_window(s_from, s_to):
    from_day, from_month = parse_day_month(s_from)
    to_day, to_month = parse_day_month(s_to)
    
    # If s_from contains both (e.g. '25 feb 7 march'), check if to_month can be found in s_from
    if from_month and not to_month:
        # Check if another month exists in s_from after from_month
        text_lower = s_from.lower().strip()
        matches = []
        for m_str, m_num in MONTH_MAP.items():
            for m in re.finditer(r'\b' + re.escape(m_str) + r'\b', text_lower):
                matches.append((m.start(), m_num))
        matches.sort()
        if len(matches) > 1:
            from_month = matches[0][1]
            to_month = matches[1][1]
            # Try to get second day
            nums = re.findall(r'\b\d{1,2}\b', text_lower)
            if len(nums) >= 2:
                from_day = int(nums[0])
                to_day = int(nums[1])

    if not from_month and not to_month:
        return {
            'startDay': 1, 'startMonth': 1, 'endDay': 31, 'endMonth': 12,
            'sowingMonths': list(range(1, 13)), 'precision': 'MONTH'
        }

    is_date_range = (from_day is not None) or (to_day is not None)
    precision = "DATE_RANGE" if is_date_range else "MONTH"

    if not from_month:
        from_month = to_month
    if not to_month:
        to_month = from_month

    if from_day is None:
        start_day = 1
    else:
        start_day = from_day

    if to_day is None:
        end_day = MONTH_DAYS[to_month]
    else:
        end_day = to_day

    if from_month <= to_month:
        m_list = list(range(from_month, to_month + 1))
    else:
        m_list = list(range(from_month, 13)) + list(range(1, to_month + 1))

    return {
        'startDay': start_day,
        'startMonth': from_month,
        'endDay': end_day,
        'endMonth': to_month,
        'sowingMonths': m_list,
        'precision': precision
    }

def build():
    mapping = {}
    with open('crops/crop_mapping_final.csv', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            orig = r['original_crop_name'].strip().lower()
            target = r['farmhelper_crop_name'].strip()
            if target != 'Unsupported':
                mapping[orig] = target
            norm = r['normalized_crop_name'].strip().lower()
            if target != 'Unsupported':
                mapping[norm] = target

    calendar_db = {}
    state_db = {}

    with open('crops/Crop_Calendar_Validated.csv', encoding='utf-8') as f:
        for line_num, r in enumerate(csv.DictReader(f), start=2):
            sl_no = r['Sl. No.'].strip()
            state = r['State'].strip()
            district = r['District Name'].strip()
            crop_raw = r['Crop'].strip()
            season = r['Season'].strip()
            sow_from = r['Sowing Period From'].strip()
            sow_to = r['Sowing Period To'].strip()

            target_crop = mapping.get(crop_raw.lower())
            if not target_crop:
                continue

            parsed = parse_window(sow_from, sow_to)
            if not parsed:
                continue

            row_ref = f"Line {line_num} (Sl {sl_no})"

            entry = {
                'state': state,
                'district': district,
                'crop': target_crop,
                'season': season or 'General',
                'sowingFrom': sow_from,
                'sowingTo': sow_to,
                'sowingMonths': parsed['sowingMonths'],
                'startDay': parsed['startDay'],
                'startMonth': parsed['startMonth'],
                'endDay': parsed['endDay'],
                'endMonth': parsed['endMonth'],
                'evidencePrecision': parsed['precision'],
                'sourceRowReference': row_ref
            }

            key = f"{state.lower()}|{district.lower()}|{target_crop.lower()}"
            if key not in calendar_db:
                calendar_db[key] = [entry]
            else:
                calendar_db[key].append(entry)

            state_key = f"{state.lower()}|{target_crop.lower()}"
            if state_key not in state_db:
                state_db[state_key] = set(parsed['sowingMonths'])
            else:
                state_db[state_key].update(parsed['sowingMonths'])

    state_db_formatted = {k: sorted(list(v)) for k, v in state_db.items()}

    ts_content = f"""/**
 * Verified Crop Calendar Data
 * Automatically parsed from crops/Crop_Calendar_Validated.csv
 * Includes exact district matching, date-range precision, and source row references.
 */

export interface DistrictCropCalendarEntry {{
  state: string;
  district: string;
  crop: string;
  season: string;
  sowingFrom: string;
  sowingTo: string;
  sowingMonths: number[];
  startDay: number;
  startMonth: number;
  endDay: number;
  endMonth: number;
  evidencePrecision: 'DATE_RANGE' | 'MONTH';
  sourceRowReference: string;
}}

export const DISTRICT_CROP_CALENDAR: Record<string, DistrictCropCalendarEntry[]> = {json.dumps(calendar_db, indent=2)};

export const STATE_CROP_CALENDAR: Record<string, number[]> = {json.dumps(state_db_formatted, indent=2)};

export interface DistrictCalendarEvidenceResult {{
  level: 'EXACT_DISTRICT' | 'STATE_WITHOUT_DISTRICT' | 'NO_EVIDENCE';
  matchedDistrict?: string;
  state?: string;
  district?: string;
  crop?: string;
  season?: string;
  sowingFrom?: string;
  sowingTo?: string;
  sowingMonths?: number[];
  evidencePrecision: 'DATE_RANGE' | 'MONTH' | 'NONE';
  source: string;
  sourceRowReference?: string;
  startDay?: number;
  startMonth?: number;
  endDay?: number;
  endMonth?: number;
  isWindowMatch: boolean;
}}

/**
 * Normalizes crop names across different alias conventions
 */
function getCropAliases(name: string): string[] {{
  const l = name.toLowerCase().trim();
  if (l.includes('rice') || l.includes('paddy')) return [l, 'rice', 'basmati rice', 'paddy', 'paddy (rainfed)', 'paddy (irrainfed)'];
  if (l.includes('pearl millet') || l.includes('bajra') || l.includes('bajara')) return [l, 'pearl millet', 'bajara', 'bajra'];
  if (l.includes('chickpea') || l.includes('gram') || l.includes('chana')) return [l, 'chickpea', 'gram'];
  if (l.includes('green gram') || l.includes('mung') || l.includes('moong')) return [l, 'green gram', 'mungbean', 'mung', 'moong'];
  if (l.includes('pigeon pea') || l.includes('arhar') || l.includes('tur')) return [l, 'pigeon pea', 'pigeonpea', 'arhar', 'tur'];
  if (l.includes('black gram') || l.includes('urad')) return [l, 'black gram', 'urad'];
  if (l.includes('cluster bean') || l.includes('guar')) return [l, 'cluster bean', 'clusterbean', 'guar'];
  if (l.includes('soybean') || l.includes('soyabean')) return [l, 'soybean', 'soyabean'];
  return [l];
}}

function isDateInsideWindow(targetDay: number, targetMonth: number, entry: DistrictCropCalendarEntry): boolean {{
  if (entry.evidencePrecision === 'MONTH') {{
    return entry.sowingMonths.includes(targetMonth);
  }}

  const sm = entry.startMonth;
  const sd = entry.startDay;
  const em = entry.endMonth;
  const ed = entry.endDay;

  if (sm <= em) {{
    if (targetMonth < sm || targetMonth > em) return false;
    if (targetMonth === sm && targetDay < sd) return false;
    if (targetMonth === em && targetDay > ed) return false;
    return true;
  }} else {{
    if (targetMonth > sm || (targetMonth === sm && targetDay >= sd)) return true;
    if (targetMonth < em || (targetMonth === em && targetDay <= ed)) return true;
    return false;
  }}
}}

/**
 * Retrieve comprehensive geographic calendar evidence (EXACT_DISTRICT or NO_EVIDENCE)
 */
export function getDistrictCalendarEvidence(
  cropName: string,
  state?: string,
  district?: string,
  targetSowingDate?: Date
): DistrictCalendarEvidenceResult {{
  const stateLower = state ? state.toLowerCase().trim() : '';
  const districtLower = district ? district.toLowerCase().trim() : '';
  const aliases = getCropAliases(cropName);

  const tDay = targetSowingDate ? targetSowingDate.getDate() : 1;
  const tMonth = targetSowingDate ? targetSowingDate.getMonth() + 1 : 1;

  if (stateLower && districtLower) {{
    for (const alias of aliases) {{
      const distKey = `${{stateLower}}|${{districtLower}}|${{alias}}`;
      if (DISTRICT_CROP_CALENDAR[distKey] && DISTRICT_CROP_CALENDAR[distKey].length > 0) {{
        const entries = DISTRICT_CROP_CALENDAR[distKey];
        // Check if ANY entry covers target sowing date
        const matchingEntry = entries.find((e) => isDateInsideWindow(tDay, tMonth, e));

        if (matchingEntry) {{
          return {{
            level: 'EXACT_DISTRICT',
            matchedDistrict: matchingEntry.district,
            state: matchingEntry.state,
            district: matchingEntry.district,
            crop: matchingEntry.crop,
            season: matchingEntry.season,
            sowingFrom: matchingEntry.sowingFrom,
            sowingTo: matchingEntry.sowingTo,
            sowingMonths: matchingEntry.sowingMonths,
            startDay: matchingEntry.startDay,
            startMonth: matchingEntry.startMonth,
            endDay: matchingEntry.endDay,
            endMonth: matchingEntry.endMonth,
            evidencePrecision: matchingEntry.evidencePrecision,
            source: `ICAR District Crop Calendar (${{matchingEntry.state}} / ${{matchingEntry.district}})`,
            sourceRowReference: matchingEntry.sourceRowReference,
            isWindowMatch: true,
          }};
        }} else {{
          // District entry exists but target date falls outside window
          const primaryEntry = entries[0];
          return {{
            level: 'EXACT_DISTRICT',
            matchedDistrict: primaryEntry.district,
            state: primaryEntry.state,
            district: primaryEntry.district,
            crop: primaryEntry.crop,
            season: primaryEntry.season,
            sowingFrom: primaryEntry.sowingFrom,
            sowingTo: primaryEntry.sowingTo,
            sowingMonths: primaryEntry.sowingMonths,
            startDay: primaryEntry.startDay,
            startMonth: primaryEntry.startMonth,
            endDay: primaryEntry.endDay,
            endMonth: primaryEntry.endMonth,
            evidencePrecision: primaryEntry.evidencePrecision,
            source: `ICAR District Crop Calendar (${{primaryEntry.state}} / ${{primaryEntry.district}})`,
            sourceRowReference: primaryEntry.sourceRowReference,
            isWindowMatch: false,
          }};
        }}
      }}
    }}
  }}

  return {{
    level: 'NO_EVIDENCE',
    evidencePrecision: 'NONE',
    source: 'No validated crop calendar record found for specified state/district',
    isWindowMatch: false,
  }};
}}

/**
 * Helper to get validated sowing months for a specific crop, state, and district
 */
export function getValidatedSowingMonths(cropName: string, state?: string, district?: string): number[] | null {{
  const evidence = getDistrictCalendarEvidence(cropName, state, district);
  return evidence.sowingMonths || null;
}}
"""

    with open('src/data/cropCalendarData.ts', 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"Generated src/data/cropCalendarData.ts with {len(calendar_db)} district keys and {len(state_db)} state keys.")

if __name__ == '__main__':
    build()
