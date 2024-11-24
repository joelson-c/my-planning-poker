import type { ActionFunctionArgs } from '@remix-run/node';
import { validateAndGetToken } from '~/lib/api/auth.server';
import { revealCards } from '~/lib/api/room';

export async function action({ request }: ActionFunctionArgs) {
    const { rawToken } = await validateAndGetToken(request);
    await revealCards(rawToken);
    return null;
}
