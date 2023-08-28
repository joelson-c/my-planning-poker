
import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

export default function useRoomData() {
    return useContext(RoomContext);
}
