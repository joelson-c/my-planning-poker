
import { useContext } from "react";
import { SocketContext } from "../context/SocketClientContext";

export default function useSocketClient() {
    return useContext(SocketContext);
}
