import {z} from 'zod';
import { loadAccounts, saveAccounts } from '../accounts.js';

const SETUP_INSTRUCTIONS = `
╔═══════════════════════════════════════════════════════════════╗
║                 How to Get Your C.AI Token                    ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Open Character.AI                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Open Chrome and go to: https://character.ai                 │
│  2. Make sure you are logged in                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Open DevTools                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Press F12 to open Developer Tools                           │
│  2. Click on the "Network" tab at the top                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Trigger an API request                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Click on any character to open a chat.                         │
│  This will trigger API requests in the Network tab.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Find the token                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. In the Network tab, look for requests to:                   │
│     "plus.character.ai" or "neo.character.ai"                   │
│                                                                 │
│  2. Click on one of those requests                              │
│                                                                 │
│  3. In the right panel, find "Request Headers"                  │
│                                                                 │
│  4. Look for a line that says:                                  │
│     authorization: Token xxxxxxxxxxxxxxxxxxxxxxx                │
│                                                                 │
│  5. Copy ONLY the part after "Token " (the long string)         │
│                                                                 │
│  Example: If you see "Token 1ec0d399af8517d7..."                │
│           Copy only: 1ec0d399af8517d7...                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Once you have the token, call add-account again with both name and token.
`;

export const definition = {
    name: 'add-account',
    description: 'Add a new Character.AI account. Call with just a name (no token) to get step-by-step instructions for finding your token.',
    inputSchema: {
        name: z.string().describe('A friendly name for this account (e.g. "main", "alt", "rp-account")'),
        token: z.string().optional().describe('The Character.AI token (hex string from browser DevTools). Omit to see setup instructions.')
    }
};

export async function handler(client, params)
{
    try
    {
        const {name, token} = params;

        if (!token)
        {
            return {
                content: [{
                    type: 'text',
                    text: SETUP_INSTRUCTIONS
                }]
            };
        }

        const cleanToken = token.trim();
        const data = loadAccounts();

        const isFirst = Object.keys(data.accounts).length === 0;
        data.accounts[name] = cleanToken;

        if (isFirst)
        {
            data.active = name;
        }

        saveAccounts(data);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    added: name,
                    is_active: data.active === name,
                    total_accounts: Object.keys(data.accounts).length
                }, null, 2)
            }]
        };
    }
    catch (error)
    {
        return {
            content: [{
                type: 'text',
                text: `ERROR: ${error.message}`
            }]
        };
    }
}
