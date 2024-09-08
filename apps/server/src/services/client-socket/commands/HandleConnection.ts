import type ICommand from "../../../contracts/ICommand";
import type { ServerUserSocket } from "my-planit-poker";
import { injectable } from "tsyringe";
import SystemUserRepository from "../../data/SystemUserRepository";

type CommandArgs = {
    socket: ServerUserSocket;
};

@injectable()
export default class HandleConnection implements ICommand<CommandArgs> {
    constructor(private systemUserRepo: SystemUserRepository) {}

    handle({ socket }: CommandArgs): void {
        const userData = this.systemUserRepo.getById(
            socket.data.session.userId,
        );
        socket.emit("connected", userData!);
    }
}
