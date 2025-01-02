import { z } from 'zod';
import type { Route } from './+types/vote';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';
import { formDataToObject } from '~/lib/utils';
import { data } from 'react-router';

const voteSchema = z.object({
    value: z.string(),
});

export async function action({ request, params, context }: Route.ActionArgs) {
    const { backend } = context;

    if (!backend.authStore.isValid) {
        throw new UnauthorizedError();
    }

    const { value: vote } = voteSchema.parse(
        formDataToObject(await request.formData()),
    );

    const user = await backend
        .collection('vote_users')
        .update(backend.authStore.record!.id, {
            vote,
        });

    // Touch room updated timestamp
    await backend.collection('vote_rooms').update(params.roomId, {
        updated: new Date(),
    });

    return data({
        value: user.vote,
    });
}
