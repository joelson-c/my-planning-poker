import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

const labelVariants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = ({
    ref,
    className,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
