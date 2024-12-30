import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
    index('./features/room-entry/index.tsx'),
    route('/room/:roomId', './features/voting/index.tsx'),
] satisfies RouteConfig;
