// native fetch is available in Node 18+

async function testBackend() {
  const payload = {
    data: {
      mode: 'AGRONOMIC_EXPLORATION',
      farm: {
        farmName: 'Transad Farm',
        district: 'Ahmedabad',
        state: 'Gujarat',
        targetSowingDate: '2027-02-01',
        waterSource: 'River',
        currentCrop: 'Wheat (Kanak)',
      },
      soil: {
        nitrogen: 200,
        phosphorus: 30,
        potassium: 240,
        ph: 7.2,
      },
      weather: {},
      candidates: [],
      deterministicAudit: {
        totalCropsEvaluated: 51,
        outsideWindowCount: 0,
        noDistrictEvidenceCount: 37,
        rotationConflictCount: 0,
        perennialCount: 14,
        phCount: 0,
        waterCount: 0,
      },
      preferredLanguage: 'en-IN',
    },
  };

  try {
    const res = await fetch('http://localhost:5001/adviseCrop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer dev-token',
      },
      body: JSON.stringify(payload),
    });

    console.log('HTTP Status:', res.status);
    const json = await res.json();
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testBackend();
