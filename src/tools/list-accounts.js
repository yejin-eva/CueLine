import {z} from 'zod';
import { loadAccounts } from '../accounts.js';

export const definition = {
    name: 'list-accounts',
    description: 'List all saved Character.AI accounts and show which one is active',
    inputSchema: {}
};

export async function handler(client, params)
{
    const data = loadAccounts();
    const names = Object.keys(data.accounts);

    if (names.length === 0)
    {
        return {
            content: [{
                type: 'text',
                text: 'No accounts saved. Use add-account to add one.'
            }]
        };
    }

    return {
        content: [{
            type: 'text',
            text: JSON.stringify({
                active: data.active,
                accounts: names.map(name => ({
                    name: name,
                    is_active: name === data.active,
                    token_preview: data.accounts[name].substring(0, 8) + '...'
                }))
            }, null, 2)
        }]
    };
}
