import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { SystemUser } from 'my-planit-poker-shared/typings/SystemUser';

import useSocketClient from '../useSocketClient';
import { useRootStore } from '../../state/rootStore';

export default function useSocketConnect(onConnected?: () => void, onError?: () => void): (userData: Omit<SystemUser, 'id'>) => void {
    const { socket, isConnected, hasError } = useSocketClient();
    const setUserData = useRootStore((state) => state.setLocalUserData);

    function connectSocket(userData: Omit<SystemUser, 'id'>): void {
        setUserData({
            username: userData.username,
            isObserver: userData.isObserver
        });

        socket.auth = {
            username: userData.username,
            isObserver: userData.isObserver
        };

        socket.disconnect().connect();
    }

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        if (onConnected) {
            onConnected();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected]);

    useEffect(() => {
        if (!hasError) {
            return;
        }

        toast.error(
            'Erro ao conectar ao servidor. Verifique sua conexão com a internet.',
            { id: 'server-connect-error' }
        );

        if (onError) {
            onError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasError]);

    return connectSocket;
}
