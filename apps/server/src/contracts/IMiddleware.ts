import type { ServerUserSocket } from "my-planit-poker";

export default interface IMiddleware {
    execute(socket: ServerUserSocket, next: Function): void;
}
