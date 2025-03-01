import type { Room } from '~/types/room';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';
import { backendClient } from '~/lib/backend/client';
import { useNavigate } from 'react-router';
import { useTransition } from 'react';
import { useVoteContext } from '~/lib/context/vote';

export function ResultHeader() {
    const { room } = useVoteContext();
    const navigate = useNavigate();
    const [, startTransition] = useTransition();

    async function resetRoom() {
        startTransition(async () => {
            await backendClient.send<Room>(
                `/api/vote/collections/voteRooms/reset/${room.id}`,
                {
                    method: 'POST',
                },
            );

            navigate(`/room/${room.id}`);
        });
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex flex-row justify-between items-center">
                    <TypographyH2>Voting Results</TypographyH2>
                    <Button onClick={resetRoom}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Start New Vote
                    </Button>
                </CardTitle>
                <CardDescription>Room ID: {room.id}</CardDescription>
            </CardHeader>
        </Card>
    );
}
