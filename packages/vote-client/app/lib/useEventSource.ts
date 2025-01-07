import { useEventSource, type EventSourceOptions } from 'remix-utils/sse/react';

export function useDecodedEvent<T>(url: string, options: EventSourceOptions) {
    const data = useEventSource(url, options);
    if (!data || data === 'UNKNOWN_EVENT_DATA') {
        return null;
    }

    return JSON.parse(data) as T;
}
