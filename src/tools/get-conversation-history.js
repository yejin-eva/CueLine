import {z} from 'zod';

export const definition = {
    name: 'get-conversation-history',
    description: 'Get conversation history with a Character.AI character',
    inputSchema: {
        character_id: z.string().describe('The character ID'),
        limit: z.number().optional().describe('Number of messages (default: 50)'),
        start_from: z.enum(['recent', 'beginning']).optional().describe('Where to start (default: recent)')
    }
};

export async function handler(client, params)
{
    try {
        const {character_id, limit = 50, start_from = 'recent'} = params;

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

        // get history - DEBUG MODE
        const history = await client.chat.history_chat_turns(chat.chat_id);
        let turns = history?.turns || [];

        // format messages - extract useful parts
        let messages = turns.map(turn => ({
            author: turn.author?.name || 'Unknown',
            is_human: turn.author?.is_human || false,
            text: turn.candidates?.[0]?.raw_content || '',
            timestamp: turn.create_time
        }));

        if (start_from === 'beginning')
        {
            messages = messages.slice(-limit);
        }
        else
        {
            messages = messages.slice(0, limit);
        }

        // return format result 
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    character_name: chat.character_name,
                    total_messages: messages.length,
                    messages: messages
                }, null, 2)
            }]
        };
    } catch (error) {
        // Catch any error and return it
        return {
            content: [{
                type: 'text',
                text: `ERROR: ${error.message}`
            }]
        };
    }
}