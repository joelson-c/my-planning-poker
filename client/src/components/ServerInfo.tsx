import useRoomData from "../hooks/useRoomData";
import useSocketClient from "../hooks/useSocketClient";

export default function ServerInfo() {
    const { isConnected, userInfo } = useSocketClient();
    const { meta: roomMeta, ping } = useRoomData();

    return (
        <>
            <h2 className="text-bold text-xl mb-3">Conexão</h2>
            <p>Conectado no servidor? {isConnected ? 'Sim' : 'Não'}</p>
            <p>ID Usuário: {userInfo?.id}</p>
            <p>ID Sala: {roomMeta?.id}</p>
            <p>Ping: {ping} ms</p>
        </>
    );
}
