const fs = require('fs');
const axios = require('axios');

if (process.argv.length < 5) {
  console.error('Usage: node pentest.js <data-sample.json> <url> <count>');
  process.exit(1);
}

const [,, dataFilePath, url, requestCount] = process.argv;
const count = parseInt(requestCount, 10);

if (isNaN(count) || count <= 0) {
  console.error('The <count> parameter must be a positive integer.');
  process.exit(1);
}

// Load data from the JSON file
let requestData;
try {
  requestData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
} catch (err) {
  console.error('Failed to read or parse the data file:', err.message);
  process.exit(1);
}

async function sendPostRequest(index) {
  try {
    const response = await axios.post(url, requestData);
    console.log(`Request #${index + 1} succeeded:`, response.status);
  } catch (error) {
    console.error(`Request #${index + 1} failed:`, error.message);
  }
}

(async () => {
  console.log(`Starting ${count} POST requests to ${url}...`);
  const promises = [];

  for (let i = 0; i < count; i++) {
    promises.push(sendPostRequest(i));
  }

  await Promise.all(promises);
  console.log('All requests completed.');
})();
