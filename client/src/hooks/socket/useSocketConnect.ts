import { SystemUser } from "my-planit-poker-shared/typings/SystemUser";
import useUserData from "../useUserData";
import useSocketClient from "../useSocketClient";

type SocketConnectResult = [(userData: Omit<SystemUser, 'id'>) => Promise<void>, () => void];

const POLLING_DELAY_MS = 250;

export default function useSocketConnect(): SocketConnectResult {
    const { socket } = useSocketClient();
    const { setUserData } = useUserData();

    async function connectSocket(userData: Omit<SystemUser, 'id'>): Promise<void> {
        setUserData({
            username: userData.username,
            isObserver: userData.isObserver
        });

        socket.auth = {
            username: userData.username,
            isObserver: userData.isObserver
        };

        socket.disconnect().connect();
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!socket.connected) {
                    return;
                }

                resolve();
                clearInterval(interval);
            }, POLLING_DELAY_MS);
        });
    }

    function disconnectSocket() {
        socket.disconnect();
    }

    return [
        connectSocket,
        disconnectSocket
    ];
}
