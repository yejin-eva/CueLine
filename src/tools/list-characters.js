export const definition = {
    name: 'list-characters',
    description: 'List all your recent Character.AI characters',
    inputSchema: {}
};

export async function handler (client)
{
    const recent = await client.character.recent_list();
    const chats = recent?.chats || [];

    return {
        content: [{
            type: 'text',
            text: JSON.stringify(chats, null, 2)
        }]
    };
}