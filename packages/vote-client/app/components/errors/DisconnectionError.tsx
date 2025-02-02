import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from '~/lib/useToast';

export function DisconnectionError() {
    const navigate = useNavigate();

    useEffect(() => {
        toast({
            title: 'Information',
            description: 'You have been disconnected from the room.',
        });

        navigate('/', { replace: true });
    }, [navigate]);

    return null;
}
