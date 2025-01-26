import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';
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
    return (
        <Button
            {...props}
            variant={selected ? 'default' : 'outline'}
            className={cn('h-16 lg:h-20 text-2xl', className)}
        >
            {value}
        </Button>
    );
}
