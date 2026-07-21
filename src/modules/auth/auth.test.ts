import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.schema';

describe('loginSchema', () => {
  it('should normalize and validate email properly', () => {
    const result = loginSchema.safeParse({
      email: '  Admin@Lydinc.Local  ',
      password: 'Admin@123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@lydinc.local');
      expect(result.data.password).toBe('Admin@123');
    }
  });

  it('should fail when email is invalid', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'Admin@123',
    });

    expect(result.success).toBe(false);
  });

  it('should fail when password is empty', () => {
    const result = loginSchema.safeParse({
      email: 'admin@lydinc.local',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});
