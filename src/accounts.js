import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

// parse .env into { active, accounts: { name: token } }
// supports both new multi-account format and old CAI_TOKEN= fallback
export function loadAccounts()
{
    let envContent;
    try
    {
        envContent = fs.readFileSync(envPath, 'utf-8');
    }
    catch (e)
    {
        return { active: null, accounts: {} };
    }

    const lines = envContent.split('\n');
    let active = null;
    const accounts = {};
    let legacyToken = null;

    for (const line of lines)
    {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const match = trimmed.match(/^([^=]+)=(.+)$/);
        if (!match) continue;

        const key = match[1].trim();
        const value = match[2].trim();

        if (key === 'CAI_ACTIVE')
        {
            active = value;
        }
        else if (key.startsWith('CAI_TOKEN_'))
        {
            const name = key.replace('CAI_TOKEN_', '').toLowerCase();
            accounts[name] = value;
        }
        else if (key === 'CAI_TOKEN')
        {
            legacyToken = value;
        }
    }

    // fallback: if no named accounts but legacy token exists, treat it as "default"
    if (Object.keys(accounts).length === 0 && legacyToken)
    {
        accounts['default'] = legacyToken;
        active = 'default';
    }

    return { active, accounts };
}

// write accounts back to .env
export function saveAccounts(data)
{
    let content = '# CueLine - Character.AI accounts\n';
    content += `# Updated: ${new Date().toISOString().split('T')[0]}\n\n`;

    if (data.active)
    {
        content += `CAI_ACTIVE=${data.active}\n\n`;
    }

    for (const [name, token] of Object.entries(data.accounts))
    {
        content += `CAI_TOKEN_${name.toUpperCase()}=${token}\n`;
    }

    fs.writeFileSync(envPath, content);
}

// get the active token
export function getActiveToken()
{
    const data = loadAccounts();
    if (data.active && data.accounts[data.active])
    {
        return data.accounts[data.active];
    }
    return null;
}
