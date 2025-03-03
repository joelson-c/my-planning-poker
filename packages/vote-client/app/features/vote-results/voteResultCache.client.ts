import type { VoteResult } from '~/types/voteResult';

const CACHE_KEY = 'cachedResults';

export function getCachedResult(): VoteResult | undefined {
    const cachedResults = localStorage.getItem(CACHE_KEY);
    if (!cachedResults) {
        return;
    }

    return JSON.parse(cachedResults) as VoteResult;
}

export function saveResultToCache(result: VoteResult) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    return result;
}

export function clearResultCache() {
    localStorage.removeItem(CACHE_KEY);
}
