import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';
import { VotingCard } from './card/VotingCard';
import { useVoteContext } from '~/lib/context/vote';

export function VoteCollectHeader() {
    const { room } = useVoteContext();

    return (
        <Card className="flex flex-col w-full">
            <CardHeader>
                <CardTitle>
                    <TypographyH2>Cast Your Vote</TypographyH2>
                </CardTitle>
                <CardDescription>Room ID: {room.id}</CardDescription>
            </CardHeader>
            <CardContent>
                <VotingCard room={room} disabled={isObserver} />
            </CardContent>
        </Card>
    );
}
