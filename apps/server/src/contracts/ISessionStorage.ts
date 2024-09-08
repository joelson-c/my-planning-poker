import type { UserSession } from "my-planit-poker";

export default interface ISessionStorage {
    getAll(): UserSession[];
    getByUserId(userId: string): UserSession | undefined;
    save(data: UserSession): string;
    update(data: UserSession): void;
    getById(id: string): UserSession | undefined;
    closeById(id: string): void;
}
