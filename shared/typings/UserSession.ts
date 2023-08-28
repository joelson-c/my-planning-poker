import { SystemUser } from "./SystemUser";

export type UserSession = {
    id: string;
    userId: SystemUser['id'];
};
