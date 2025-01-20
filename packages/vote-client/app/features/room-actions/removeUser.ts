import type { RecordAuthResponse } from 'pocketbase';
import type { Route } from './+types/removeUser';
import type { Room } from '~/types/room';
import { z } from 'zod';
import { formDataToObject } from '~/lib/utils';
import { backendClient } from '~/lib/backend/client';

const removeUserSchema = z.object({
    target: z.string(),
});

export async function clientAction({ request }: Route.ClientActionArgs) {
    const { target } = removeUserSchema.parse(
        formDataToObject(await request.formData()),
    );

    await backendClient.send<RecordAuthResponse<Room>>(
        `/api/vote/collections/voteRooms/remove-user`,
        {
            method: 'POST',
            body: {
                target,
            },
        },
    );

    return new Response(null, {
        status: 201,
    });
}
