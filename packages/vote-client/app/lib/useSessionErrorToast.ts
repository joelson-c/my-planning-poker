import { useEffect } from 'react';
import { toast } from '~/lib/useToast';

export function useSessionErrorToast(sessionError: string | undefined) {
    useEffect(() => {
        if (!sessionError) {
            return;
        }

        toast({
            title: 'An error occurred',
            description: sessionError,
        });
    }, [sessionError]);
}
