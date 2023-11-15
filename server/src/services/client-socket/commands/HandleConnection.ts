import { injectable } from "tsyringe";
import ICommand from "../../../contracts/ICommand";
import { UserSocket } from "my-planit-poker-shared/typings/ServerTypes";
import SystemUserRepository from "../../data/SystemUserRepository";

type CommandArgs = {
    socket: UserSocket;
}

@injectable()
export default class HandleConnection implements ICommand<CommandArgs> {
    constructor(
        private systemUserRepo: SystemUserRepository
    ) { }

    handle({ socket }: CommandArgs): void {
        const userData = this.systemUserRepo.getById(socket.data.session.userId);
        socket.emit('connected', userData!);
    }
}
