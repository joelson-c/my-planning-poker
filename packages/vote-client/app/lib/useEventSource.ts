import { createContext, useContext, useEffect, useState } from 'react';

export interface EventSourceOptions {
    init?: EventSourceInit;
    event?: string;
    enabled?: boolean;
    decode?: boolean;
    cacheKey?: string;
}

export type EventSourceMap = Map<
    string,
    { count: number; source: EventSource }
>;

const context = createContext<EventSourceMap>(
    new Map<string, { count: number; source: EventSource }>(),
);

export const EventSourceProvider = context.Provider;

/**
 * Subscribe to an event source and return the latest event.
 * @param url The URL of the event source to connect to
 * @param options The options to pass to the EventSource constructor
 * @returns The last event received from the server
 */
export function useEventSource<T>(
    url: string | URL,
    {
        event = 'message',
        init,
        enabled = true,
        decode = true,
        cacheKey,
    }: EventSourceOptions = {},
) {
    const map = useContext(context);
    const [data, setData] = useState<T | null>(null);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const key = cacheKey ?? url.toString();
        const value = map.get(key) ?? {
            count: 0,
            source: new EventSource(url, init),
        };

        ++value.count;

        map.set(key, value);

        value.source.addEventListener(event, handler);
        value.source.addEventListener('error', errorHandler);

        // rest data if dependencies change
        setData(null);
        setHasError(false);

        function handler(event: MessageEvent) {
            const eventData = decode
                ? JSON.parse(event.data || '{}')
                : event.data || 'UNKNOWN_EVENT_DATA';

            setData(eventData);
        }

        function errorHandler() {
            setHasError(true);
        }

        return () => {
            value.source.removeEventListener(event, handler);
            value.source.removeEventListener('error', errorHandler);
            --value.count;
            if (value.count <= 0) {
                value.source.close();
                map.delete(key);
            }
        };
    }, [url, event, map, enabled]);

    return {
        data,
        hasError,
    };
}
