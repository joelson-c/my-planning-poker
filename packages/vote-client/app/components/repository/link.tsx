import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '~/lib/utils';
import { Button } from '../ui/button';
import { Github } from '../icons/github';

interface RepositoryLinkProps extends ComponentPropsWithoutRef<typeof Button> {}

export function RepositoryLink({ className, ...props }: RepositoryLinkProps) {
    return (
        <Button
            {...props}
            variant="outline"
            className={cn('w-full', className)}
            asChild
        >
            <a
                href="https://github.com/joelson-c/my-planning-poker"
                target="_blank"
                rel="noreferrer"
            >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
            </a>
        </Button>
    );
}
