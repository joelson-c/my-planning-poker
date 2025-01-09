import type { RecordAuthResponse } from 'pocketbase';
import type { Route } from './+types/removeUser';
import type { Room } from '~/types/room';
import { z } from 'zod';
import { getCurrentUser } from '~/lib/user.server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { formDataToObject } from '~/lib/utils';

const removeUserSchema = z.object({
    target: z.string(),
});

export async function action({
    context: { backend },
    request,
}: Route.ActionArgs) {
    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    const { target } = removeUserSchema.parse(
        formDataToObject(await request.formData()),
    );

    await backend.send<RecordAuthResponse<Room>>(
        `/api/vote/collections/vote_rooms/remove-user`,
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
