/**
 * Simple test - just try to reach Character.AI
 */

async function main() {
  console.log('🔍 Testing connection to Character.AI...\n');

  // Test 1: Basic fetch to character.ai
  console.log('Test 1: Fetching character.ai homepage...');
  try {
    const response = await fetch('https://character.ai/');
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${response.headers.get('content-type')}`);

    const text = await response.text();
    if (text.includes('Cloudflare')) {
      console.log('  ⚠️  Cloudflare challenge detected!');
    } else if (text.includes('character.ai') || text.includes('Character.AI')) {
      console.log('  ✅ Got Character.AI page');
    } else {
      console.log('  ❓ Unknown response');
      console.log('  First 200 chars:', text.substring(0, 200));
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
  }

  // Test 2: Try the API endpoint
  console.log('\nTest 2: Fetching plus.character.ai/chat/user/...');
  try {
    const token = 'Fe26.2*1*741a9c2a33f3c4d2a43a7b7163b0ce1098edd9f2e0413ff7861324a2315d228e*i4Kzls1ZR5XVgaHCJsvL8g*RkZjsOfoL7pRARU8qx24dGhkCnxH5zlTWBpekXjo8lkGIHSZJtuksJDdFFuUaXugwewIWH3SsKbKJR3w5zHQ4g**83323bda9e62d1155c830bbd05b2aa3420f28abf840c566fe2c47016297091f9*C8fybVeB0Kwi876kMLa-M7sI__7k2Fc7bFmqzXMLxoI~2';

    const response = await fetch('https://plus.character.ai/chat/user/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    console.log(`  Status: ${response.status}`);

    const text = await response.text();
    console.log('  Response:', text.substring(0, 300));
  } catch (e) {
    console.log('  ❌ Error:', e.message);
  }

  // Test 3: Try with cookie instead
  console.log('\nTest 3: Fetching with cookie auth...');
  try {
    const token = 'Fe26.2*1*741a9c2a33f3c4d2a43a7b7163b0ce1098edd9f2e0413ff7861324a2315d228e*i4Kzls1ZR5XVgaHCJsvL8g*RkZjsOfoL7pRARU8qx24dGhkCnxH5zlTWBpekXjo8lkGIHSZJtuksJDdFFuUaXugwewIWH3SsKbKJR3w5zHQ4g**83323bda9e62d1155c830bbd05b2aa3420f28abf840c566fe2c47016297091f9*C8fybVeB0Kwi876kMLa-M7sI__7k2Fc7bFmqzXMLxoI~2';

    const response = await fetch('https://plus.character.ai/chat/user/', {
      headers: {
        'Cookie': `web-next-auth=${token}`
      }
    });
    console.log(`  Status: ${response.status}`);

    const text = await response.text();
    console.log('  Response:', text.substring(0, 300));
  } catch (e) {
    console.log('  ❌ Error:', e.message);
  }
}

main();
