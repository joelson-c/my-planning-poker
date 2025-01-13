import type { Room } from '~/types/room';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useFetcher } from 'react-router';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';

interface ResultHeaderProps {
    room: Room;
}

export function ResultHeader({ room }: ResultHeaderProps) {
    const fetcher = useFetcher();

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex flex-row justify-between items-center">
                    <TypographyH2>Voting Results</TypographyH2>
                    <fetcher.Form
                        action={`/room/${room.id}/reset`}
                        method="POST"
                    >
                        <Button type="submit">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Start New Vote
                        </Button>
                    </fetcher.Form>
                </CardTitle>
                <CardDescription>Room ID: {room.id}</CardDescription>
            </CardHeader>
        </Card>
    );
}
