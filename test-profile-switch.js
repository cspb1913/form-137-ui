#!/usr/bin/env node

/**
 * Test Profile Switching Functionality
 */

const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'GET', timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function testProfileDisplay() {
  console.log('🧪 Testing profile role display...');
  
  const response = await makeRequest('http://localhost:3000');
  
  if (response.status === 200) {
    // Look for role information in the dev panel
    if (response.body.includes('Current User:')) {
      console.log('✅ Current User info present');
    }
    if (response.body.includes('Role:')) {
      console.log('✅ Role info present');
    }
    if (response.body.includes('Admin') || response.body.includes('Requester')) {
      console.log('✅ Role badge visible');
    }
    
    // Check for profile switching interface
    if (response.body.includes('Switch Profile:') && response.body.includes('role="combobox"')) {
      console.log('✅ Profile switching interface available');
    }
  } else {
    console.log(`❌ Failed to load page: ${response.status}`);
  }
}

async function main() {
  console.log('🚀 Testing Profile Switching Functionality');
  console.log('Note: Manual testing required for actual profile switching via browser UI');
  
  await testProfileDisplay();
  
  console.log('\n📋 To test profile switching manually:');
  console.log('1. Open http://localhost:3000 in browser');
  console.log('2. Look at the orange development panel in bottom-right');
  console.log('3. Use the "Switch Profile:" dropdown to select "Requester"');
  console.log('4. Click "Switch Profile" button');
  console.log('5. Page should reload with Requester role (only "Requester" in role badge)');
  console.log('6. Try accessing /admin - should show unauthorized or redirect');
  console.log('7. Switch back to "Admin" to restore admin access');
}

if (require.main === module) {
  main().catch(console.error);
}