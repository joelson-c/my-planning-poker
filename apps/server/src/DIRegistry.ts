import { registry } from "tsyringe";
import InMemorySession from "./services/data/session/InMemorySession";
import Logger from "./services/Logger";
import "./middlewares/MiddlewareRegistry";

@registry([
    { token: "ISessionStorage", useClass: InMemorySession },
    { token: "ILogger", useClass: Logger },
])
export default class DIRegistry {}
