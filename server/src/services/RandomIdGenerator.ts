import { injectable } from "tsyringe";
import { randomBytes } from "crypto";

@injectable()
export default class RandomIdGenerator {
    generateRandomId(bytes: number): string {
        // Length = bytes = 2
        return randomBytes(bytes).toString('hex');
    }

}
