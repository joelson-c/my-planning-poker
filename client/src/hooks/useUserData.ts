
import { useContext } from "react";
import { UserContext } from "../context/LocalUserDataContext";

export default function useUserData() {
    return useContext(UserContext);
}
