import type { Route } from './+types';
import { LoginCard } from './card';

export async function loader({ request, context }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const roomId = searchParams.get('roomId');

    return {
        roomId,
        context,
    };
}

export async function action({ request }: Route.ActionArgs) {}

export default function RoomEntryIndex({ loaderData }: Route.ComponentProps) {
    const { roomId, context } = loaderData;

    console.log(context);

    return (
        <main>
            <LoginCard roomId={roomId || undefined} />
        </main>
    );
}
