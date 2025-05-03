import type { Route } from './+types';
import { Link, redirect } from 'react-router';
import { LoginCard } from '../../components/room-login/LoginCard';
import { formDataToObject } from '~/lib/utils';
import { LoginForm } from '../../components/room-login/LoginForm';
import { Button } from '~/components/ui/button';
import { createSchema } from '~/components/room-login/schema';
import { nanoid } from 'nanoid';
import { pushJoinRoomEvent } from '~/lib/analytics/events';

export function meta() {
    return [{ title: 'My Planning Poker' }];
}

export async function clientLoader({
    params: { roomId },
}: Route.ClientLoaderArgs) {
    const prevNickname = localStorage.getItem('lastNickname');

    return {
        prevNickname,
        roomId,
    };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
    const inputData = formDataToObject(await request.formData());
    const create = createSchema.parse({ roomId: '', ...inputData });
    localStorage.setItem('joinData', JSON.stringify(create));

    const roomId = nanoid();
    pushJoinRoomEvent(roomId);
    return redirect(`/room/${roomId}`);
}

export default function RoomCreate({
    loaderData: { prevNickname },
}: Route.ComponentProps) {
    return (
        <LoginCard title="Create a Room">
            <LoginForm
                defaultValues={{
                    nickname: prevNickname || '',
                }}
            />
            <Button variant="link" asChild>
                <Link to="/join">Join a Room</Link>
            </Button>
        </LoginCard>
    );
}
