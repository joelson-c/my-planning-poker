import {
    Card,
    CardTitle,
    CardDescription,
    CardContent,
} from '~/components/ui/card';
import { TypographyH2 } from '~/components/ui/typography';
import type { RoomStatus } from '~/lib/realtimeWorker/messages';
import { ResetButton } from './ResetButton';
import { RevealButton } from './RevealButton';
import { ShareButton } from './ShareButton';

interface HeaderProps {
    status: RoomStatus;
    roomId: string;
    onReset?: () => void;
    onReveal?: () => void;
}

export function Header({ status, roomId, onReset, onReveal }: HeaderProps) {
    const hasRevealed = status === 'reveal';

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 items-center justify-between">
                    <div>
                        <CardTitle className="flex flex-row justify-between items-center">
                            <TypographyH2>
                                {hasRevealed
                                    ? 'Voting Results'
                                    : 'Cast Your Vote'}
                            </TypographyH2>
                        </CardTitle>
                        <CardDescription>Room ID: {roomId}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-4 lg:gap-6 *:w-full *:sm:w-auto">
                        {hasRevealed ? (
                            <ResetButton onClick={onReset} />
                        ) : (
                            <RevealButton onClick={onReveal} />
                        )}
                        <ShareButton roomId={roomId} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
