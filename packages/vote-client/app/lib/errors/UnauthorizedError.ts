export class UnauthorizedError extends Error {
    constructor() {
        super('You are not authorized to perform this action.');
        this.name = 'UnauthorizedError';
    }
}
