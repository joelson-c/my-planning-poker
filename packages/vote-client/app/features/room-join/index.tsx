import type { Route } from './+types';
import { Link, redirect } from 'react-router';
import { LoginCard } from '~/components/room-login/LoginCard';
import { formDataToObject } from '~/lib/utils';
import { LoginForm } from '~/components/room-login/LoginForm';
import { Button } from '~/components/ui/button';
import { joinSchema } from '~/components/room-login/schema';
import { pushJoinRoomEvent } from '~/lib/analytics/events';

export function meta() {
    return [{ title: 'Join Planning Poker Room' }];
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
    const login = joinSchema.parse(inputData);
    localStorage.setItem('joinData', JSON.stringify(login));
    localStorage.setItem('lastNickname', login.nickname);

    pushJoinRoomEvent(login.roomId);
    return redirect(`/room/${login.roomId}`);
}

export default function RoomJoin({
    loaderData,
    params: { roomId },
}: Route.ComponentProps) {
    const { prevNickname } = loaderData;

    return (
        <LoginCard title="Join a Room">
            <LoginForm
                roomId={roomId}
                defaultValues={{
                    nickname: prevNickname || '',
                    roomId,
                }}
                isJoining
            />
            <Button variant="link" asChild>
                <Link to="/">Create a new room</Link>
            </Button>
        </LoginCard>
    );
}
