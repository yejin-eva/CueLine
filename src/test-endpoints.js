/**
 * Test different Character.AI endpoints to find working auth
 */

const TOKEN = 'Fe26.2*1*741a9c2a33f3c4d2a43a7b7163b0ce1098edd9f2e0413ff7861324a2315d228e*i4Kzls1ZR5XVgaHCJsvL8g*RkZjsOfoL7pRARU8qx24dGhkCnxH5zlTWBpekXjo8lkGIHSZJtuksJDdFFuUaXugwewIWH3SsKbKJR3w5zHQ4g**83323bda9e62d1155c830bbd05b2aa3420f28abf840c566fe2c47016297091f9*C8fybVeB0Kwi876kMLa-M7sI__7k2Fc7bFmqzXMLxoI~2';

async function testEndpoint(name, url, headers) {
  console.log(`\n${name}`);
  console.log(`  URL: ${url}`);
  try {
    const response = await fetch(url, { headers });
    console.log(`  Status: ${response.status}`);
    const text = await response.text();

    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log(`  Response (JSON):`, JSON.stringify(json, null, 2).substring(0, 500));
    } catch {
      console.log(`  Response: ${text.substring(0, 200)}`);
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function main() {
  console.log('🔍 Testing various Character.AI endpoints...');

  // Test with cookie on main site
  await testEndpoint(
    'Test 1: character.ai/api/trpc/user.info',
    'https://character.ai/api/trpc/user.info?batch=1',
    { 'Cookie': `web-next-auth=${TOKEN}` }
  );

  // Test settings endpoint
  await testEndpoint(
    'Test 2: character.ai/api/trpc/settings',
    'https://character.ai/api/trpc/settings.getSettings?batch=1',
    { 'Cookie': `web-next-auth=${TOKEN}` }
  );

  // Test character endpoint
  await testEndpoint(
    'Test 3: character.ai/api/trpc/character.recent',
    'https://character.ai/api/trpc/character.recentList?batch=1&input={}',
    { 'Cookie': `web-next-auth=${TOKEN}` }
  );

  // Test neo API with cookie
  await testEndpoint(
    'Test 4: neo.character.ai with cookie',
    'https://neo.character.ai/recommendation/v1/user',
    { 'Cookie': `web-next-auth=${TOKEN}` }
  );

  // Test plus API with cookie
  await testEndpoint(
    'Test 5: plus.character.ai/chat/user/ with cookie',
    'https://plus.character.ai/chat/user/',
    { 'Cookie': `web-next-auth=${TOKEN}` }
  );

  console.log('\n✅ Done testing endpoints');
}

main();
