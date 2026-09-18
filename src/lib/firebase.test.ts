import { describe, it, expect } from 'vitest';
import { normalizeData } from './firebase';

describe('normalizeData utility', () => {
  it('returns primitive values unchanged', () => {
    expect(normalizeData('hello')).toBe('hello');
    expect(normalizeData(123)).toBe(123);
    expect(normalizeData(null)).toBeNull();
    expect(normalizeData(undefined)).toBeUndefined();
  });

  it('normalizes mock timestamp objects with seconds and nanoseconds', () => {
    const mockTimestamp = { seconds: 1700000000, nanoseconds: 0 };
    const result = normalizeData(mockTimestamp);
    expect(typeof result).toBe('number');
    expect(result).toBe(1700000000 * 1000);
  });

  it('recursively normalizes nested objects and arrays', () => {
    const input = {
      id: 'trip-1',
      name: 'Aegean Sanctuary',
      createdAt: { seconds: 1700000000, nanoseconds: 0 },
      participants: [{ userId: 'u1', joinedAt: { seconds: 1700000100, nanoseconds: 0 } }],
    };

    const output = normalizeData<any>(input);
    expect(output.id).toBe('trip-1');
    expect(typeof output.createdAt).toBe('number');
    expect(output.createdAt).toBe(1700000000 * 1000);
    expect(typeof output.participants[0].joinedAt).toBe('number');
    expect(output.participants[0].joinedAt).toBe(1700000100 * 1000);
  });
});
