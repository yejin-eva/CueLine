import {z} from 'zod';

export const definition = {
    name: 'delete-messages',
    description: 'Permanently delete one or more messages from a Character.AI conversation',
    inputSchema: {
        character_id: z.string().describe('The character ID'),
        turn_ids: z.array(z.string()).describe('Array of turn IDs to delete')
    }
};

export async function handler(client, params)
{
    try
    {
        const {character_id, turn_ids} = params;

        await client.character.connect(character_id);
        await client.character.delete_message(turn_ids);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    deleted_count: turn_ids.length,
                    turn_ids: turn_ids
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
