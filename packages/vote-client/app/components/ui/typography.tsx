import type { PropsWithChildren } from 'react';

export function TypographyH1({ children }: PropsWithChildren) {
    return (
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            {children}
        </h1>
    );
}

export function TypographyH2({ children }: PropsWithChildren) {
    return (
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {children}
        </h2>
    );
}
