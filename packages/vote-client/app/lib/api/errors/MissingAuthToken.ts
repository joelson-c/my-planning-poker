export class MissingAuthToken extends Error {
    constructor() {
        super('Missing auth token in session.');
    }
}
