import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
    index('./features/room-entry/index.tsx'),
    route('/room/:roomId', './features/voting/index.tsx'),
    route('/room/:roomId/vote', './features/voting/actions/vote.ts'),
    route('/room/:roomId/join', './features/room-entry/join.tsx'),
    route('/sse/room/:roomId', './features/sse/room.ts'),
] satisfies RouteConfig;
