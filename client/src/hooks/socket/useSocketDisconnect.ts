import useSocketClient from "../useSocketClient";
import { useEffect } from "react";
import useRemoteDataCleaner from "../useRemoteDataCleaner";

export default function useSocketDisconnect(callback?: () => void): () => void {
    const { socket, isConnected } = useSocketClient();
    const cleanData = useRemoteDataCleaner();

    function disconnectSocket() {
        socket.disconnect();
    }

    useEffect(() => {
        if (!isConnected) {
            return
        }

        cleanData();
        callback && callback();
    }, [callback, cleanData, isConnected]);

    return disconnectSocket;
}
