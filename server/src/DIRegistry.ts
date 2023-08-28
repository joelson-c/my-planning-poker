import { registry } from 'tsyringe';

import './middlewares/MiddlewareRegistry';

import InMemorySession from './services/data/session/InMemorySession';
import Logger from './services/Logger';

@registry([
    { token: 'ISessionStorage', useClass: InMemorySession },
    { token: 'ILogger', useClass: Logger },
])
export default class DIRegistry { }
