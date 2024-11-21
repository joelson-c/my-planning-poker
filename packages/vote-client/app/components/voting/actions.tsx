import { useCallback } from 'react';
import { Button } from '../ui/button';
import { useNavigate } from '@remix-run/react';

interface VotingActionsProps {
    roomId: string;
}

export function VotingActions({ roomId }: VotingActionsProps) {
    const navigate = useNavigate();
    const onRevealClick = useCallback(() => {
        navigate(`/result/${roomId}`);
    }, [navigate, roomId]);

    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Button onClick={onRevealClick}>Reveal Cards</Button>
            <Button variant="outline">Reset</Button>
        </div>
    );
}
