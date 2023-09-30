namespace NodeJS {
    interface ProcessEnv extends ProcessEnv {
        NODE_PORT?: string;
        CORS_ORIGIN?: string;
        DISABLE_EMPTY_ROOM_CLEANUP?: boolean;
        NODE_ENV?: 'development' | 'production';
    }
}

