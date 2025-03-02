import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';
import { useVoteContext } from '~/lib/context/vote';
import { cn } from '~/lib/utils';

interface VotingCardItemProps extends ComponentProps<typeof Button> {
    value: string;
    selected?: boolean;
}

export function VotingCardItem({
    value,
    selected,
    className,
    ...props
}: VotingCardItemProps) {
    const { currentUser } = useVoteContext();

    return (
        <Button
            {...props}
            variant={selected ? 'default' : 'outline'}
            className={cn('h-16 lg:h-20 text-2xl', className)}
            disabled={currentUser.observer}
            role="switch"
            aria-checked={selected}
        >
            {value}
        </Button>
    );
}
