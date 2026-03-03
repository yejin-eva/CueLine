import {z} from 'zod';

export const definition = {
    name: 'get-conversation-history',
    description: 'Get conversation history with a Character.AI character. Use fetch_all to retrieve the entire conversation for summarization or story conversion.',
    inputSchema: {
        character_id: z.string().describe('The character ID'),
        limit: z.number().optional().describe('Number of messages to return (default: 50). Ignored when fetch_all is true.'),
        start_from: z.enum(['recent', 'beginning']).optional().describe('Where to start (default: recent). Ignored when fetch_all is true.'),
        fetch_all: z.boolean().optional().describe('Fetch the entire conversation history (default: false). Can be slow for long conversations.')
    }
};

export async function handler(client, params)
{
    try {
        const {character_id, limit = 50, start_from = 'recent', fetch_all = false} = params;

        // get recent chats to find chat_id
        const recent = await client.character.recent_list();
        const chats = recent?.chats || [];

        // find chat for this character
        const chat = chats.find(c => c.character_id == character_id);
        if (!chat)
        {
            return {
                content: [{
                    type: 'text',
                    text: `No chat found for character: ${character_id}`
                }]
            };
        }

        let allTurns = [];

        if (fetch_all)
        {
            // paginate through entire history (50 turns per page)
            let next_token = "";
            do {
                const page = await client.chat.history_chat_turns(chat.chat_id, next_token);
                allTurns.push(...(page?.turns || []));
                next_token = page?.meta?.next_token ?? "";
                console.error(`Fetched ${allTurns.length} turns so far...`);
            } while (next_token);
        }
        else
        {
            const history = await client.chat.history_chat_turns(chat.chat_id);
            allTurns = history?.turns || [];
        }

        // slice before formatting so we don't map turns we'll discard
        if (!fetch_all)
        {
            if (start_from === 'beginning')
            {
                allTurns = allTurns.slice(-limit);
            }
            else
            {
                allTurns = allTurns.slice(0, limit);
            }
        }

        const messages = allTurns.map(turn => ({
            turn_id: turn.turn_key?.turn_id || null,
            author: turn.author?.name || 'Unknown',
            is_human: turn.author?.is_human || false,
            text: turn.candidates?.[0]?.raw_content || '',
            candidates: (turn.candidates || []).map(c => ({
                candidate_id: c.candidate_id,
                text: c.raw_content || ''
            })),
            primary_candidate_id: turn.primary_candidate_id || null,
            timestamp: turn.create_time
        }));

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    character_name: chat.character_name,
                    returned_count: messages.length,
                    messages: messages
                }, null, 2)
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: 'text',
                text: `ERROR: ${error.message}`
            }]
        };
    }
}