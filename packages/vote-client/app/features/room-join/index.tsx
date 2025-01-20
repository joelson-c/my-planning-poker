import type { Route } from './+types';
import { Link, redirect } from 'react-router';
import { LoginCard } from '~/components/room-login/LoginCard';
import { roomJoinSchema } from '~/lib/roomFormSchema';
import { formDataToObject } from '~/lib/utils';
import { LoginForm } from '~/components/room-login/LoginForm';
import { Button } from '~/components/ui/button';
import { authWithRoomAndUserId } from '~/lib/backend/auth';

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
    const joinData = roomJoinSchema.parse(inputData);
    localStorage.setItem('lastNickname', joinData.nickname);

    const { record } = await authWithRoomAndUserId(joinData);
    return redirect(`/room/${record.room}`);
}

export default function RoomJoin({
    loaderData,
    params: { roomId },
}: Route.ComponentProps) {
    const { prevNickname } = loaderData;

    return (
        <LoginCard title="Join a Room">
            <div className="flex flex-col gap-4">
                <LoginForm
                    roomId={roomId}
                    prevNickname={prevNickname}
                    schema={roomJoinSchema}
                />
                <Button variant="link" asChild>
                    <Link to="/">Create a new room</Link>
                </Button>
            </div>
        </LoginCard>
    );
}
