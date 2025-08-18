#!/usr/bin/env node

/**
 * Test Dashboard API Connectivity
 */

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.data) {
      req.write(options.data);
    }
    req.end();
  });
}

async function testApiEndpoints() {
  const API_BASE_URL = 'http://localhost:8080';
  
  console.log('🧪 Testing API endpoints...');
  
  // Test basic health endpoints
  try {
    const livenessResult = await makeRequest(`${API_BASE_URL}/api/health/liveness`);
    console.log(`✅ Liveness: ${livenessResult.status} - ${livenessResult.body}`);
  } catch (error) {
    console.log(`❌ Liveness failed: ${error.message}`);
  }

  try {
    const readinessResult = await makeRequest(`${API_BASE_URL}/api/health/readiness`);
    console.log(`✅ Readiness: ${readinessResult.status} - ${readinessResult.body}`);
  } catch (error) {
    console.log(`❌ Readiness failed: ${error.message}`);
  }

  // Test dashboard endpoint (might require auth)
  try {
    const dashboardResult = await makeRequest(`${API_BASE_URL}/api/dashboard`);
    console.log(`Dashboard endpoint: ${dashboardResult.status}`);
    if (dashboardResult.status === 401) {
      console.log('  ✅ Dashboard requires authentication (expected)');
    } else if (dashboardResult.status === 200) {
      console.log('  ✅ Dashboard accessible');
    } else {
      console.log(`  ⚠️ Dashboard returned: ${dashboardResult.status}`);
    }
  } catch (error) {
    console.log(`❌ Dashboard test failed: ${error.message}`);
  }
}

async function testUILoadPage() {
  console.log('\n🧪 Testing UI main page load...');
  
  try {
    const response = await makeRequest('http://localhost:3000');
    
    if (response.status === 200) {
      console.log('✅ UI page loads successfully');
      
      // Check if it contains expected elements
      const indicators = [
        { text: '🔧 Development Mode', desc: 'Dev mode indicator' },
        { text: 'Form 137 Portal', desc: 'App title' },
        { text: 'Switch Profile', desc: 'Profile switcher' }
      ];
      
      for (const indicator of indicators) {
        if (response.body.includes(indicator.text)) {
          console.log(`  ✅ ${indicator.desc} present`);
        } else {
          console.log(`  ❌ ${indicator.desc} missing`);
        }
      }
    } else {
      console.log(`❌ UI page failed to load: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ UI test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Testing Dashboard API Connectivity');
  console.log('Testing both API and UI endpoints...\n');
  
  await testApiEndpoints();
  await testUILoadPage();
  
  console.log('\n📋 Next steps:');
  console.log('1. Switch to Requester profile in the UI');
  console.log('2. Check if dashboard loads without "Failed to load dashboard data" error');
  console.log('3. Monitor browser developer console for any token-related errors');
}

if (require.main === module) {
  main().catch(console.error);
}