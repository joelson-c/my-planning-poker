export class InvalidAuthToken extends Error {
    constructor() {
        super('Invalid auth token in session.');
    }
}
