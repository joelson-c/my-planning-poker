import path from 'path';

export const roomData = path.join(
    import.meta.dirname,
    '../../playwright/.auth/room.id',
);

export const firstUserAuth = path.join(
    import.meta.dirname,
    '../../playwright/.auth/user0.json',
);

export const secondUserAuth = path.join(
    import.meta.dirname,
    '../../playwright/.auth/user1.json',
);

export const observerUserAuth = path.join(
    import.meta.dirname,
    '../../playwright/.auth/user2.json',
);
