import {
    index,
    prefix,
    route,
    type RouteConfig,
} from '@react-router/dev/routes';

export default [
    index('./features/room-create/index.tsx'),
    route('/join/:roomId?', './features/room-join/index.tsx'),

    ...prefix('/room/:roomId', [
        index('./features/vote-collect/index.tsx'),
        route('result', './features/vote-results/index.tsx'),
    ]),
] satisfies RouteConfig;
