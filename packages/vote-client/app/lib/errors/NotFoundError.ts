export class NotFoundError extends Error {
    constructor() {
        super('The resource was not found.');
        this.name = 'NotFoundError';
    }
}
