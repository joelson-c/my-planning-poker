export class UnauthorizedError extends Response {
    constructor() {
        super('You are not authorized to perform this action.', {
            status: 401,
        });
    }
}
