import { registry } from 'tsyringe';
import SessionMiddleware from './SessionMiddleware';

@registry([
    { token: 'IMiddleware', useClass: SessionMiddleware },
])
export default class MiddlewareRegistry { }
