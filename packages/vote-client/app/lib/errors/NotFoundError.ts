export class NotFoundError extends Response {
    constructor() {
        super('The resource was not found.', {
            status: 404,
        });
    }
}
