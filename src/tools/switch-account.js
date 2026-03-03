import {z} from 'zod';
import { loadAccounts, saveAccounts } from '../accounts.js';

export const definition = {
    name: 'switch-account',
    description: 'Switch to a different Character.AI account. Use list-accounts first to see available accounts.',
    inputSchema: {
        name: z.string().describe('The account name to switch to')
    }
};

export async function handler(client, params)
{
    try
    {
        const {name} = params;
        const data = loadAccounts();

        if (!data.accounts[name])
        {
            return {
                content: [{
                    type: 'text',
                    text: `ERROR: Account "${name}" not found. Available: ${Object.keys(data.accounts).join(', ') || 'none'}`
                }]
            };
        }

        if (data.active === name)
        {
            return {
                content: [{
                    type: 'text',
                    text: `Already on account "${name}".`
                }]
            };
        }

        // logout current session
        try
        {
            await client.logout();
        }
        catch (e)
        {
            console.error(`Logout note: ${e}`);
        }

        // login with new account
        await client.login(data.accounts[name]);

        data.active = name;
        saveAccounts(data);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    switched_to: name,
                    status: 'logged in'
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
