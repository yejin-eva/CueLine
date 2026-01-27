#!/usr/bin/env node

// import servers
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod/mini';
import { CAINode } from 'cainode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import * as listCharacters from './tools/list-characters.js';
import * as getConversationHistory from './tools/get-conversation-history.js';
import * as sendMessage from './tools/send-message.js';

// Get the directory where this script is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// load token from .env file (always from project root)
function loadToken()
{
    try
    {
        const envPath = path.join(__dirname, '..', '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/CAI_TOKEN=(.+)/);
        if (match)
        {
            return match[1].trim();
        }
    }
    catch (e)
    {
        // file not found or can't read
    }
    return null;
}

const server = new McpServer({
    name: 'cueline',
    version: '1.0.0'
});

const client = new CAINode();
let isLoggedIn = false;

async function ensureLoggedIn()
{
    if (isLoggedIn) return true;

    const token = loadToken();
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

async function main()
{
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('CueLine server running');
}

main();