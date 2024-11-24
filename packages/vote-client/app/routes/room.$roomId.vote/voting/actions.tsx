import { useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';

export function VotingActions() {
    const revealFetcher = useFetcher();

    const onRevealClick = () => {
        revealFetcher.submit(null, {
            method: 'post',
            action: `/room/reveal-cards`,
        });
    };

    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Button onClick={onRevealClick}>Reveal Cards</Button>
            <Button variant="outline">Reset</Button>
        </div>
    );
}
