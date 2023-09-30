import { useRootStore } from "../state/rootStore";

export default function useRemoteDataCleaner(): () => void {
    const { clearRoomData, clearRemoteUserData } = useRootStore((state) => ({
        clearRoomData: state.clearRoomData,
        clearRemoteUserData: state.clearRemoteUserData
    }));

    function cleanRemoteData() {
        clearRoomData();
        clearRemoteUserData();
    }

    return cleanRemoteData;
}
