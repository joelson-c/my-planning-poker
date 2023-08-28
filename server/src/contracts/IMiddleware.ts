import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";

export default interface IMiddleware {
    execute(socket: UserSocket, next: Function): void;
}
