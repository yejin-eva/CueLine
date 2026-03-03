import {z} from 'zod';

export const definition = {
    name: 'generate-turn',
    description: 'Make a character respond without sending a message. Like pressing enter on an empty input. Can be called multiple times to let the character keep talking.',
    inputSchema: {
        character_id: z.string().describe('The character ID')
    }
};

export async function handler(client, params)
{
    try
    {
        const {character_id} = params;

        await client.character.connect(character_id);
        const response = await client.character.generate_turn();

        const reply = response?.turn?.candidates?.[0]?.raw_content || 'No response';

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    character_id: character_id,
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
