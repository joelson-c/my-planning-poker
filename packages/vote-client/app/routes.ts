import {
    index,
    prefix,
    route,
    type RouteConfig,
} from '@react-router/dev/routes';

export default [
    index('./features/room-entry/index.tsx'),

    ...prefix('/room/:roomId', [
        index('./features/voting/index.tsx'),
        route('vote', './features/voting/actions/vote.ts'),
        route('join', './features/room-entry/join.tsx'),
        route('realtime', './features/voting/actions/realtime.ts'),
        route('heartbeat', './features/voting/actions/heartbeat.ts'),
    ]),
] satisfies RouteConfig;
