import type { RecordAuthResponse } from 'pocketbase';
import type { Route } from './+types/transferAdmin';
import type { Room } from '~/types/room';
import { z } from 'zod';
import { getCurrentUser } from '~/lib/user.server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { formDataToObject } from '~/lib/utils';

const transferAdminSchema = z.object({
    target: z.string(),
});

export async function action({ context, request }: Route.ActionArgs) {
    const { backend } = context;
    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    const { target } = transferAdminSchema.parse(
        formDataToObject(await request.formData()),
    );

    await backend.send<RecordAuthResponse<Room>>(
        `/api/vote/collections/vote_rooms/transfer-admin`,
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
