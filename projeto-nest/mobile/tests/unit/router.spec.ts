import { describe, expect, it } from 'vitest';
import { resetRouteFromUrl } from '@/router';

describe('resetRouteFromUrl', () => {
  it('routes a valid mobile reset link without exposing other URLs', () => {
    expect(resetRouteFromUrl('mlestoque://reset-password?token=abc123')).toEqual({
      path: '/reset-password',
      query: { token: 'abc123' },
    });
  });

  it('rejects missing tokens and unrelated links', () => {
    expect(resetRouteFromUrl('mlestoque://reset-password')).toBeNull();
    expect(resetRouteFromUrl('https://example.com/reset-password?token=abc123')).toBeNull();
  });
});
