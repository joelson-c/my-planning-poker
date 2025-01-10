import {
    index,
    prefix,
    route,
    type RouteConfig,
} from '@react-router/dev/routes';

export default [
    index('./features/room-create/index.tsx'),
    route('/join/:roomId', './features/room-join/index.tsx'),

    ...prefix('/room/:roomId', [
        index('./features/vote-collect/index.tsx'),
        route('result', './features/vote-results/index.tsx'),
        // Actions
        route('vote', './features/room-actions/vote.ts'),
        route('realtime', './features/room-actions/realtime.ts'),
        route('heartbeat', './features/room-actions/heartbeat.ts'),
        route('reveal', './features/room-actions/reveal.ts'),
        route('reset', './features/room-actions/reset.ts'),
        route('remove-user', './features/room-actions/removeUser.ts'),
    ]),
] satisfies RouteConfig;
