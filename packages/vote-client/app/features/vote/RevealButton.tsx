import { Eye } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';

export function RevealButton(props: ComponentProps<typeof Button>) {
    return (
        <Button {...props}>
            <Eye className="mr-2 h-4 w-4" /> Reveal Cards
        </Button>
    );
}
