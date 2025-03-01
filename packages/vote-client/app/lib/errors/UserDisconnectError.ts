export class UserDisconnectError extends Error {
    constructor() {
        super('You were disconnected from the server.');
        this.name = 'UserDisconnectError';
    }
}
