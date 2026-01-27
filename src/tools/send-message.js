import {z} from 'zod';

export const definition = {
    name: 'send-message',
    description: 'Send a message to a Character.AI character and get their response',
    inputSchema: {
        character_id: z.string().describe('The character ID to message'),
        message: z.string().describe('The message to send')
    }
};

export async function handler(client, params)
{
    try
    {
        const {character_id, message} = params;

        // connect to character
        await client.character.connect(character_id);

        // send message and get response
        const response = await client.character.send_message(message, false);

        // extract reply text
        const reply = response?.turn?.candidates?.[0]?.raw_content || 'No response';

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    character_id: character_id,
                    your_message: message,
                    character_reply: reply
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