import { SystemUser } from "my-planit-poker-shared/typings/SystemUser";
import useSocketClient from "../useSocketClient";
import { useEffect } from "react";
import { useRootStore } from "../../state/rootStore";

export default function useSocketConnect(callback?: () => {}): (userData: Omit<SystemUser, 'id'>) => void {
    const { socket, isConnected } = useSocketClient();
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

        callback && callback();
    }, [isConnected]);

    return connectSocket;
}
