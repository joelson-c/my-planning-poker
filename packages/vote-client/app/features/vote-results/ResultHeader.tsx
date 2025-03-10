import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';
import { useVoteContext } from '~/lib/context/vote';

export function ResultHeader() {
    const { outboundDispatcher, roomId } = useVoteContext();

    function resetRoom() {
        outboundDispatcher({
            name: 'WS_RESET',
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
                <CardDescription>Room ID: {roomId}</CardDescription>
            </CardHeader>
        </Card>
    );
}
