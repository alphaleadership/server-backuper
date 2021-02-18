const https = require('https');

const data = 'Done!';

const options = {
  hostname: 'api.keyvalue.xyz',
  port: 443,
  path: '/8c745558/myKey',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
    'Content-Length': data.length
  }
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end();
