import { useEffect } from 'react';

import { useRootStore } from '../state/rootStore';
import useSocketClient from '../hooks/useSocketClient';

const PING_FREQUENCE_MS = 750;

export default function ServerInfo() {
    const { socket, isConnected } = useSocketClient();
    const { roomMeta, myUser, ping } = useRootStore((state) => ({
        roomMeta: state.roomMeta,
        myUser: state.getMyRemoteUser(),
        ping: state.connectionPing
    }));
    const updatePing = useRootStore((state) => state.updatePing);

    useEffect(() => {
        async function sendPing() {
            const start = Date.now();
            await socket.emitWithAck('ping');
            updatePing(Date.now() - start);
        }

        if (!isConnected) {
            updatePing(undefined);
            return;
        }

        sendPing();

        const interval = setTimeout(sendPing, PING_FREQUENCE_MS);
        return () => clearTimeout(interval);
    }, [isConnected, socket, updatePing]);

    return (
        <>
            <h2 className="text-bold text-xl mb-3">Conexão</h2>
            <p>Conectado no servidor? {isConnected ? 'Sim' : 'Não'}</p>
            <p>ID Usuário: {myUser?.userId}</p>
            <p>ID Sala: {roomMeta?.id}</p>
            <p>Ping: {ping} ms</p>
        </>
    );
}
