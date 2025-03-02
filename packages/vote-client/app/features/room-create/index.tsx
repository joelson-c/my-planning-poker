import type { Route } from './+types';
import { Link, redirect } from 'react-router';
import { LoginCard } from '../../components/room-login/LoginCard';
import { roomCreateSchema } from '../../lib/roomFormSchema';
import { formDataToObject } from '~/lib/utils';
import { LoginForm } from '../../components/room-login/LoginForm';
import { Button } from '~/components/ui/button';
import { backendClient } from '~/lib/backend/client';
import { authWithRoomAndUserId } from '~/lib/backend/auth';

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
    const joinData = roomCreateSchema.parse(inputData);

    const room = await backendClient.collection('voteRooms').create({
        cardType: 'FIBONACCI',
        state: 'VOTING',
    });

    localStorage.setItem('lastNickname', joinData.nickname);
    const { record } = await authWithRoomAndUserId({
        ...joinData,
        roomId: room.id,
    });

    return redirect(`/room/${record.room}`);
}

export default function RoomCreate({
    loaderData: { prevNickname },
}: Route.ComponentProps) {
    return (
        <LoginCard title="Create a Room">
            <LoginForm prevNickname={prevNickname} schema={roomCreateSchema} />
            <Button variant="link" asChild>
                <Link to="/join">Join a Room</Link>
            </Button>
        </LoginCard>
    );
}
