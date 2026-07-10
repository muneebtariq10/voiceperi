require('dotenv').config();
const https = require('https');

function testEndpoint(name, options, headers = {}, validateFn) {
  return new Promise((resolve) => {
    const req = https.request(options, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ name, status: res.statusCode, valid: validateFn(json, res.statusCode), data: json });
        } catch (e) {
          resolve({ name, status: res.statusCode, valid: false, error: 'JSON Parse Error' });
        }
      });
    });
    req.on('error', (e) => resolve({ name, status: 0, valid: false, error: e.message }));
    req.end();
  });
}

async function run() {
  const results = [];

  // 1. Retell AI
  results.push(await testEndpoint(
    'Retell AI',
    'https://api.retellai.com/list-voices',
    { 'Authorization': `Bearer ${process.env.RETELL_API_KEY}` },
    (json, status) => status === 200 && Array.isArray(json)
  ));

  // 2. Stripe
  results.push(await testEndpoint(
    'Stripe',
    'https://api.stripe.com/v1/products',
    { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    (json, status) => status === 200 && json.object === 'list'
  ));

  // 3. ElevenLabs
  results.push(await testEndpoint(
    'ElevenLabs',
    'https://api.elevenlabs.io/v1/voices',
    { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    (json, status) => status === 200 && json.voices !== undefined
  ));

  // 4. Google Places
  results.push(await testEndpoint(
    'Google Places',
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=pizza&key=${process.env.GOOGLE_PLACES_API_KEY}`,
    {},
    (json, status) => status === 200 && json.status !== 'REQUEST_DENIED'
  ));

  for (const r of results) {
    console.log(`[${r.valid ? 'OK' : 'FAIL'}] ${r.name} (Status: ${r.status})`);
    if (!r.valid) {
      console.log(`  Details: ${JSON.stringify(r.data || r.error).substring(0, 200)}`);
    }
  }
}

run();
