export class UserDisconnectError extends Error {
    constructor() {
        super('You was disconnected from the server.');
        this.name = 'UserDisconnectError';
    }
}
