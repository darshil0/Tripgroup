import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('handles conditional class names', () => {
    const isHidden = false;
    expect(cn('px-2', isHidden && 'py-4', 'bg-black')).toBe('px-2 bg-black');
  });

  it('merges tailwind classes using tailwind-merge', () => {
    expect(cn('px-2 px-4', 'text-red-500 text-blue-500')).toBe('px-4 text-blue-500');
  });
});
