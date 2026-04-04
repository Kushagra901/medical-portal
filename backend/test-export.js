const jwt = require('jsonwebtoken');
const http = require('http');

const SECRET = 'your_super_secret_jwt_key_change_this_in_production';
const token = jwt.sign({ id: '60d5ecb8b392d72f9c5d1e43', role: 'doctor' }, SECRET, { expiresIn: '1h' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/export/all-data',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    if (res.statusCode !== 200) {
      console.log('Error Data:', data);
    } else {
      console.log('Data string length:', data.length);
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed successfully. Found doctors:', parsed.data.doctors.length);
      } catch(e) { console.error('Parse error:', e); }
    }
  });
});
req.on('error', e => console.error(e));
req.end();
