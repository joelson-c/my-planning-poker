import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '~/lib/utils';
import { Button } from '../ui/button';
import { GithubIcon } from '../icons/GithubIcon';

export function RepositoryLink({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof Button>) {
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
                <GithubIcon className="dark:text-white mr-2 h-4 w-4" />
                View on GitHub
            </a>
        </Button>
    );
}
