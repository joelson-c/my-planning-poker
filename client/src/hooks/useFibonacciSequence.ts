import { useMemo } from 'react';

function calculateFibonacci(maxNumber: number): number[] {
    let n1 = 0, n2 = 1, nextTerm = 0;
    const result = [n1];

    nextTerm = n1 + n2;

    do {
        result.push(nextTerm);

        n1 = n2;
        n2 = nextTerm;
        nextTerm = n1 + n2;
    } while (nextTerm <= maxNumber);

    return result;
}

export default function useFibonacciSequence(maxNumber: number): number[] {
    const sequence = useMemo(() => calculateFibonacci(maxNumber), [maxNumber]);
    return sequence;
}

