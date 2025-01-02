export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message || 'You are not authorized to perform this action.');
        this.name = 'UnauthorizedError';
    }
}
