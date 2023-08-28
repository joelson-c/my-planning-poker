
import { useContext } from "react";
import { UserContext } from "../context/UserDataContext";

export default function useUserData() {
    return useContext(UserContext);
}
