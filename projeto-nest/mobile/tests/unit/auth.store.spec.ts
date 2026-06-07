import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const biometricMocks = vi.hoisted(() => ({
  isAvailable: vi.fn(),
  verifyIdentity: vi.fn(),
  setCredentials: vi.fn(),
  getCredentials: vi.fn(),
  deleteCredentials: vi.fn(),
}));

const preferenceMocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('@capgo/capacitor-native-biometric', () => ({
  NativeBiometric: biometricMocks,
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: preferenceMocks,
}));

vi.mock('@/services/api', () => ({
  default: apiMocks,
}));

import { useAuthStore } from '@/stores/auth';

describe('auth store biometrics', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    biometricMocks.isAvailable.mockResolvedValue({ isAvailable: true });
    biometricMocks.verifyIdentity.mockResolvedValue(undefined);
    biometricMocks.setCredentials.mockResolvedValue(undefined);
    biometricMocks.deleteCredentials.mockResolvedValue(undefined);
    preferenceMocks.set.mockResolvedValue(undefined);
    preferenceMocks.remove.mockResolvedValue(undefined);
  });

  it('marks biometrics linked only after credentials can be read back', async () => {
    biometricMocks.getCredentials.mockResolvedValue({
      username: 'a@b.com',
      password: 'secret',
    });
    const store = useAuthStore();
    store.biometricsAvailable = true;

    const result = await store.enrollBiometrics({
      email: 'a@b.com',
      password: 'secret',
    });

    expect(result).toEqual({ success: true });
    expect(preferenceMocks.set).toHaveBeenCalledWith({
      key: 'biometrics_linked',
      value: 'true',
    });
    expect(store.biometricsLinked).toBe(true);
  });

  it('does not mark biometrics linked when credential verification fails', async () => {
    biometricMocks.getCredentials.mockResolvedValue({
      username: 'other@b.com',
      password: 'secret',
    });
    const store = useAuthStore();
    store.biometricsAvailable = true;

    const result = await store.enrollBiometrics({
      email: 'a@b.com',
      password: 'secret',
    });

    expect(result).toEqual({ success: false, reason: 'credentials-missing' });
    expect(preferenceMocks.set).not.toHaveBeenCalled();
    expect(store.biometricsLinked).toBe(false);
  });

  it('clears a stale link when biometric credentials are missing', async () => {
    biometricMocks.getCredentials.mockRejectedValue(new Error('missing'));
    const store = useAuthStore();
    store.biometricsAvailable = true;
    store.biometricsLinked = true;

    const result = await store.loginWithBiometrics();

    expect(result).toEqual({ success: false, reason: 'credentials-missing' });
    expect(preferenceMocks.remove).toHaveBeenCalledWith({ key: 'biometrics_linked' });
    expect(store.biometricsLinked).toBe(false);
  });
});
