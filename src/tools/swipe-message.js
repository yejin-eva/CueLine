import {z} from 'zod';

export const definition = {
    name: 'swipe-message',
    description: 'Swipe on a character message: generate a new alternative response, or select an existing candidate. Use get-conversation-history first to find turn_ids and candidate_ids.',
    inputSchema: {
        character_id: z.string().describe('The character ID'),
        turn_id: z.string().describe('The turn ID to swipe on'),
        action: z.enum(['generate', 'select']).describe('"generate" for a new response (swipe right), "select" to pick an existing candidate (swipe left)'),
        candidate_id: z.string().optional().describe('Required when action is "select". The candidate ID to switch to.')
    }
};

export async function handler(client, params)
{
    try
    {
        const {character_id, turn_id, action, candidate_id} = params;

        await client.character.connect(character_id);

        // resolve chat_id from character_id
        const recent = await client.character.recent_list();
        const chat = (recent?.chats || []).find(c => c.character_id == character_id);
        if (!chat)
        {
            return {
                content: [{
                    type: 'text',
                    text: `No chat found for character: ${character_id}`
                }]
            };
        }

        if (action === 'generate')
        {
            const response = await client.character.generate_turn_candidate(turn_id);
            const newCandidate = response?.turn?.candidates?.[0];

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        action: 'generate',
                        turn_id: turn_id,
                        new_candidate_id: newCandidate?.candidate_id || null,
                        new_text: newCandidate?.raw_content || 'No response generated'
                    }, null, 2)
                }]
            };
        }
        else if (action === 'select')
        {
            if (!candidate_id)
            {
                return {
                    content: [{
                        type: 'text',
                        text: 'ERROR: candidate_id is required when action is "select"'
                    }]
                };
            }

            // fetch the candidate's current text so edit_message preserves it
            // while triggering update_primary_candidate internally
            const history = await client.chat.history_chat_turns(chat.chat_id);
            const turn = history?.turns?.find(t => t.turn_key?.turn_id === turn_id);
            const candidate = turn?.candidates?.find(c => c.candidate_id === candidate_id);

            if (!candidate)
            {
                return {
                    content: [{
                        type: 'text',
                        text: `ERROR: Could not find candidate ${candidate_id} on turn ${turn_id}`
                    }]
                };
            }

            await client.character.edit_message(candidate_id, turn_id, candidate.raw_content);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        action: 'select',
                        turn_id: turn_id,
                        selected_candidate_id: candidate_id,
                        text: candidate.raw_content
                    }, null, 2)
                }]
            };
        }
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
