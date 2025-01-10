export class NicknameTakenError extends Error {
    constructor() {
        super('The nickname is already taken.');
        this.name = 'NicknameTaken';
    }
}
