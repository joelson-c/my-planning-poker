import { Vote } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';

export function ResetButton(props: ComponentProps<typeof Button>) {
    return (
        <Button {...props}>
            <Vote className="mr-2 h-4 w-4" /> Start New Vote
        </Button>
    );
}
