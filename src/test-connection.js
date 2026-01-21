/**
 * Test script - Connect to Character.AI and list characters
 */

import { CAINode } from 'cainode';
import * as fs from 'fs';

// Load token from .env file
function loadToken() {
  try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const match = envContent.match(/CAI_TOKEN=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch (e) {
    console.error('Could not read .env file');
  }
  return null;
}

async function main() {
  const token = loadToken();

  if (!token) {
    console.log('❌ No token found in .env file');
    process.exit(1);
  }

  console.log('🔑 Token loaded from .env');
  console.log('📡 Connecting to Character.AI...\n');

  const client = new CAINode();

  try {
    await client.login(token);
    console.log('✅ Login successful!\n');

    // Try to get recent characters
    console.log('📋 Fetching recent characters...\n');
    const recent = await client.character.recent_list();

    // The API returns "chats" not "characters"
    const chats = recent?.chats || recent?.characters || [];

    if (chats.length > 0) {
      console.log(`Found ${chats.length} recent chats:\n`);

      for (const chat of chats.slice(0, 10)) {
        const name = chat.character_name || chat.participant__name || 'Unknown';
        const id = chat.character_id || chat.external_id || 'N/A';
        console.log(`  • ${name}`);
        console.log(`    Character ID: ${id}`);
        console.log(`    Chat ID: ${chat.chat_id || 'N/A'}\n`);
      }

      if (chats.length > 10) {
        console.log(`  ... and ${chats.length - 10} more\n`);
      }
    } else {
      console.log('No recent chats found');
      console.log('Response:', JSON.stringify(recent, null, 2));
    }

    await client.logout();
    console.log('👋 Logged out');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

main();
