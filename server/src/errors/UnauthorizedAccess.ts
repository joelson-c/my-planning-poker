export default class UnauthorizedAccess extends Error {
    constructor() {
        super("The user does not have authorization to access the resource");
        this.name = "UnauthorizedAccess";
      }
}
