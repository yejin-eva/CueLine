#!/usr/bin/env node

// import servers
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CAINode } from 'cainode';

import * as listCharacters from './tools/list-characters.js';
import * as getConversationHistory from './tools/get-conversation-history.js';
import * as sendMessage from './tools/send-message.js';
import * as deleteMessages from './tools/delete-messages.js';
import * as swipeMessage from './tools/swipe-message.js';
import * as generateTurn from './tools/generate-turn.js';
import * as listAccounts from './tools/list-accounts.js';
import * as addAccount from './tools/add-account.js';
import * as switchAccount from './tools/switch-account.js';
import { getActiveToken } from './accounts.js';


const server = new McpServer({
    name: 'cueline',
    version: '1.0.0'
});

const client = new CAINode();
let isLoggedIn = false;

async function ensureLoggedIn()
{
    if (isLoggedIn) return true;

    const token = getActiveToken();
    if (!token) return false;

    await client.login(token);
    isLoggedIn = true;
    return true;
}

server.registerTool(
    listCharacters.definition.name,
    listCharacters.definition,
    async () => {
        if (!await ensureLoggedIn())
        {
            return {content: [{
                type: 'text',
                text: 'Error: No token. Run npm run setup'
            }]};
        }
        return listCharacters.handler(client);
    }
);

server.registerTool(
    getConversationHistory.definition.name,
    getConversationHistory.definition,
    async (params) => 
    {
        if (!await ensureLoggedIn())
        {
            return { content: [{
                type: 'text',
                text: 'Error: No token. Run npm run setup'
            }]};
        }
        return getConversationHistory.handler(client, params);
    }
);

server.registerTool(
    sendMessage.definition.name,
    sendMessage.definition,
    async (params) =>
    {
        if (!await ensureLoggedIn())
        {
            return {content: [{
                type: 'text',
                text: 'Error: No token. Run npm run setup'
            }]};
        }
        return sendMessage.handler(client, params);
    }
)

server.registerTool(
    deleteMessages.definition.name,
    deleteMessages.definition,
    async (params) =>
    {
        if (!await ensureLoggedIn())
        {
            return {content: [{
                type: 'text',
                text: 'Error: No token. Run npm run setup'
            }]};
        }
        return deleteMessages.handler(client, params);
    }
);

server.registerTool(
    swipeMessage.definition.name,
    swipeMessage.definition,
    async (params) =>
    {
        if (!await ensureLoggedIn())
        {
            return {content: [{
                type: 'text',
                text: 'Error: No token. Run npm run setup'
            }]};
        }
        return swipeMessage.handler(client, params);
    }
);

server.registerTool(
    generateTurn.definition.name,
    generateTurn.definition,
    async (params) =>
    {
        if (!await ensureLoggedIn())
        {
            return {content: [{
                type: 'text',
                text: 'Error: No token. Run npm run setup'
            }]};
        }
        return generateTurn.handler(client, params);
    }
);

server.registerTool(
    listAccounts.definition.name,
    listAccounts.definition,
    async () => listAccounts.handler(client)
);

server.registerTool(
    addAccount.definition.name,
    addAccount.definition,
    async (params) => addAccount.handler(client, params)
);

server.registerTool(
    switchAccount.definition.name,
    switchAccount.definition,
    async (params) =>
    {
        const result = await switchAccount.handler(client, params);
        // update login state after switching
        isLoggedIn = !result.content[0].text.startsWith('ERROR');
        return result;
    }
);

async function main()
{
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('CueLine server running');
}

main();