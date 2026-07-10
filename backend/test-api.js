const http = require('http');

const testForgotPassword = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'nonexistent@example.com' });
    const req = http.request(
      'http://localhost:3000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const testPaymentPlansCreate = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      priceId: 'test_price',
      planName: 'Test Plan',
      planPrice: 10,
      currency: 'USD',
      billingInterval: 'month',
      minuteIncluded: 100,
      features: [],
      isActive: true,
      description: 'Test'
    });
    const req = http.request(
      'http://localhost:3000/api/payment-plans',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('Testing forgot-password (should return 201/200 with generic message)...');
  const fpRes = await testForgotPassword();
  console.log('Status:', fpRes.status);
  console.log('Body:', fpRes.body);

  console.log('\nTesting create payment plan without auth (should return 401 Unauthorized)...');
  const ppRes = await testPaymentPlansCreate();
  console.log('Status:', ppRes.status);
  console.log('Body:', ppRes.body);
}

runTests().catch(console.error);
