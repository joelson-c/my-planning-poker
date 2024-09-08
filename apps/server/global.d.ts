declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_PORT?: string;
        CORS_ORIGIN?: string;
        DISABLE_EMPTY_ROOM_CLEANUP?: string;
        NODE_ENV?: 'development' | 'production';
    }
}

