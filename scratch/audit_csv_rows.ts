import fs from 'fs';

const csv = fs.readFileSync('crops/Crop_Calendar_Validated.csv', 'utf8');
const lines = csv.split('\n');

const headers = lines[0].split(',');
console.log('Headers:', headers);

const gujaratRows: Array<{ lineNum: number; slNo: string; district: string; crop: string; season: string; from: string; to: string }> = [];

lines.forEach((l, idx) => {
  if (idx === 0) return;
  const parts = l.split(',');
  if (parts.length > 2 && parts[1]?.trim().toLowerCase() === 'gujarat') {
    gujaratRows.push({
      lineNum: idx + 1, // 1-based line number in CSV
      slNo: parts[0]?.trim(),
      district: parts[2]?.trim(),
      crop: parts[4]?.trim(),
      season: parts[5]?.trim(),
      from: parts[6]?.trim(),
      to: parts[7]?.trim(),
    });
  }
});

console.log('Total Gujarat rows in CSV:', gujaratRows.length);
console.log('\n=== ALL AHMEDABAD ROWS IN CSV ===');
gujaratRows.filter(r => r.district.toLowerCase() === 'ahmedabad').forEach(r => {
  console.log(`Line ${r.lineNum} (Sl ${r.slNo}): Crop=${r.crop}, Season=${r.season}, SowingFrom="${r.from}", SowingTo="${r.to}"`);
});

console.log('\n=== ALL ANAND ROWS IN CSV ===');
gujaratRows.filter(r => r.district.toLowerCase() === 'anand').forEach(r => {
  console.log(`Line ${r.lineNum} (Sl ${r.slNo}): Crop=${r.crop}, Season=${r.season}, SowingFrom="${r.from}", SowingTo="${r.to}"`);
});
