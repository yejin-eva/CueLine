/**
 * CueLine Setup Script
 * Helps user get their Character.AI token from browser DevTools
 */

import * as readline from 'readline';
import * as fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    🎭 CueLine Setup                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\nThis will help you get your Character.AI authentication token.\n');

  // Step 1
  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│ STEP 1: Open Character.AI                                       │');
  console.log('├─────────────────────────────────────────────────────────────────┤');
  console.log('│                                                                 │');
  console.log('│  1. Open Chrome and go to: https://character.ai                 │');
  console.log('│  2. Make sure you are logged in                                 │');
  console.log('│                                                                 │');
  console.log('└─────────────────────────────────────────────────────────────────┘');
  await ask('\nPress Enter when ready...');

  // Step 2
  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│ STEP 2: Open DevTools                                           │');
  console.log('├─────────────────────────────────────────────────────────────────┤');
  console.log('│                                                                 │');
  console.log('│  1. Press F12 to open Developer Tools                           │');
  console.log('│  2. Click on the "Network" tab at the top                       │');
  console.log('│                                                                 │');
  console.log('└─────────────────────────────────────────────────────────────────┘');
  await ask('\nPress Enter when ready...');

  // Step 3
  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│ STEP 3: Trigger an API request                                  │');
  console.log('├─────────────────────────────────────────────────────────────────┤');
  console.log('│                                                                 │');
  console.log('│  Click on any character to open a chat.                         │');
  console.log('│  This will trigger API requests in the Network tab.             │');
  console.log('│                                                                 │');
  console.log('└─────────────────────────────────────────────────────────────────┘');
  await ask('\nPress Enter when ready...');

  // Step 4
  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│ STEP 4: Find the token                                          │');
  console.log('├─────────────────────────────────────────────────────────────────┤');
  console.log('│                                                                 │');
  console.log('│  1. In the Network tab, look for requests to:                   │');
  console.log('│     "plus.character.ai" or "neo.character.ai"                   │');
  console.log('│                                                                 │');
  console.log('│  2. Click on one of those requests                              │');
  console.log('│                                                                 │');
  console.log('│  3. In the right panel, find "Request Headers"                  │');
  console.log('│                                                                 │');
  console.log('│  4. Look for a line that says:                                  │');
  console.log('│     authorization: Token xxxxxxxxxxxxxxxxxxxxxxx                │');
  console.log('│                                                                 │');
  console.log('│  5. Copy ONLY the part after "Token " (the long string)         │');
  console.log('│                                                                 │');
  console.log('│  Example: If you see "Token 1ec0d399af8517d7..."                │');
  console.log('│           Copy only: 1ec0d399af8517d7...                        │');
  console.log('│                                                                 │');
  console.log('└─────────────────────────────────────────────────────────────────┘');

  // Step 5
  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│ STEP 5: Paste your token below                                  │');
  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  const token = await ask('Your token: ');

  if (!token || token.trim().length === 0) {
    console.log('\n❌ No token provided. Setup cancelled.');
    rl.close();
    process.exit(1);
  }

  const cleanToken = token.trim();

  // Validate token format
  if (!/^[a-f0-9]{30,50}$/i.test(cleanToken)) {
    console.log('\n⚠️  Warning: Token format looks unusual.');
    console.log('   Expected: ~40 character hex string');
    console.log('   Example:  1ec0d399af8517d733d117e317757c14300f06de');
    console.log(`   Got:      ${cleanToken.substring(0, 30)}${cleanToken.length > 30 ? '...' : ''}`);

    const proceed = await ask('\nSave anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      process.exit(0);
    }
  }

  // Save to .env file
  const envContent = `# Character.AI API Token
# Retrieved via CueLine setup on ${new Date().toISOString().split('T')[0]}
# To get a new token: npm run setup
CAI_TOKEN=${cleanToken}
`;

  fs.writeFileSync('.env', envContent);

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ Setup Complete!                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\nYour token has been saved to .env');
  console.log('\nTest your connection with:');
  console.log('  npm run test:connection\n');

  rl.close();
}

main();
