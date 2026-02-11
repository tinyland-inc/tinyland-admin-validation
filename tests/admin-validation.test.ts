import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  // Types (tested via value exports)
  type AdminUser,
  type AdminActivityLog,
  type AdminPermission,
  // Constants
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  // Schemas
  adminUserSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  adminActivityLogSchema,
  // Functions
  sanitizeAdminUser,
  validateActivityLog,
  validateAdminUser,
  validateCreateAdminUser,
  validateUpdateAdminUser,
} from '../src/index.js';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const NOW = '2024-01-15T12:00:00.000Z';
const LATER = '2024-06-15T12:00:00.000Z';

function validAdminUser() {
  return {
    id: 'usr_abc123',
    username: 'testadmin',
    passwordHash: '$2b$10$hashedpasswordvalue',
    totpSecretId: 'totp_123',
    totpEnabled: true,
    createdAt: NOW,
    updatedAt: LATER,
    lastLoginAt: NOW,
    isActive: true,
    role: 'admin' as const,
  };
}

function validCreateInput() {
  return {
    username: 'newuser',
    password: 'securepass123',
    role: 'editor' as const,
  };
}

function validActivityLog() {
  return {
    id: 'log_001',
    adminUserId: 'usr_abc123',
    action: 'user_created',
    resourceType: 'user',
    resourceId: 'usr_def456',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    details: { note: 'Created by admin' },
    createdAt: NOW,
  };
}

// ---------------------------------------------------------------------------
// 1. Types (compile-time + runtime shape checks)
// ---------------------------------------------------------------------------

describe('Types', () => {
  it('AdminUser interface accepts a minimal valid object', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
    };
    expect(user.id).toBe('1');
    expect(user.username).toBe('test');
    expect(user.role).toBe('admin');
  });

  it('AdminUser interface accepts all optional fields', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      displayName: 'Test User',
      name: 'Test',
      handle: 'testhandle',
      email: 'test@example.com',
      password: 'plain',
      passwordHash: 'hashed',
      totpSecret: 'secret',
      totpSecretId: 'sid',
      totpEnabled: true,
      tempPassword: 'temp',
      qrCode: 'data:image/png;base64,...',
      totpUri: 'otpauth://totp/...',
      createdAt: NOW,
      updatedAt: NOW,
      lastLoginAt: null,
      lastLogin: NOW,
      isActive: true,
      firstLogin: false,
      needsOnboarding: false,
      onboardingStep: 3,
      permissions: ['admin.access'],
      certificateCn: 'cn=test',
      invitedBy: 'usr_000',
      invitationToken: 'tok_123',
      invitationExpires: NOW,
      profileVisibility: 'public',
      profilePhoto: 'https://example.com/photo.jpg',
      bio: 'Hello',
      pronouns: 'they/them',
      socialLinks: { twitter: '@test' },
      preferences: { theme: 'dark' },
      backupCodes: ['code1', 'code2'],
      certificate_cn: 'cn=legacy',
      invited_by: 'usr_legacy',
      invitation_token: 'tok_legacy',
    };
    expect(user.displayName).toBe('Test User');
    expect(user.socialLinks?.twitter).toBe('@test');
  });

  it('AdminActivityLog interface accepts a valid log object', () => {
    const log: AdminActivityLog = {
      id: '1',
      adminUserId: 'usr_1',
      action: 'login',
      resourceType: 'session',
      resourceId: null,
      ipAddress: null,
      userAgent: null,
      details: null,
      createdAt: NOW,
    };
    expect(log.adminUserId).toBe('usr_1');
  });

  it('AdminActivityLog interface accepts legacy fields', () => {
    const log: AdminActivityLog = {
      id: '1',
      adminUserId: 'usr_1',
      action: 'login',
      resourceType: 'session',
      resourceId: null,
      ipAddress: null,
      userAgent: null,
      details: null,
      createdAt: NOW,
      admin_user_id: 'usr_1',
      resource_type: 'session',
      resource_id: null,
      ip_address: null,
      user_agent: null,
      created_at: NOW,
    };
    expect(log.admin_user_id).toBe('usr_1');
  });

  it('AdminPermission type allows all 9 permission values', () => {
    const perms: AdminPermission[] = [
      'admin.access',
      'admin.users.manage',
      'admin.users.moderate',
      'admin.content.manage',
      'admin.content.moderate',
      'admin.events.manage',
      'admin.analytics.view',
      'admin.settings.manage',
      'admin.security.manage',
    ];
    expect(perms).toHaveLength(9);
  });
});

// ---------------------------------------------------------------------------
// 2. ADMIN_ROLES constant
// ---------------------------------------------------------------------------

describe('ADMIN_ROLES', () => {
  it('has exactly 7 entries', () => {
    expect(ADMIN_ROLES).toHaveLength(7);
  });

  it('includes super_admin', () => {
    expect(ADMIN_ROLES).toContain('super_admin');
  });

  it('includes admin', () => {
    expect(ADMIN_ROLES).toContain('admin');
  });

  it('includes moderator', () => {
    expect(ADMIN_ROLES).toContain('moderator');
  });

  it('includes editor', () => {
    expect(ADMIN_ROLES).toContain('editor');
  });

  it('includes event_manager', () => {
    expect(ADMIN_ROLES).toContain('event_manager');
  });

  it('includes contributor', () => {
    expect(ADMIN_ROLES).toContain('contributor');
  });

  it('includes viewer', () => {
    expect(ADMIN_ROLES).toContain('viewer');
  });

  it('does not include member', () => {
    expect(ADMIN_ROLES).not.toContain('member');
  });

  it('is an array', () => {
    expect(Array.isArray(ADMIN_ROLES)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. ADMIN_PERMISSIONS constant
// ---------------------------------------------------------------------------

describe('ADMIN_PERMISSIONS', () => {
  it('has exactly 9 entries', () => {
    expect(ADMIN_PERMISSIONS).toHaveLength(9);
  });

  it('includes admin.access', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.access');
  });

  it('includes admin.users.manage', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.users.manage');
  });

  it('includes admin.users.moderate', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.users.moderate');
  });

  it('includes admin.content.manage', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.content.manage');
  });

  it('includes admin.content.moderate', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.content.moderate');
  });

  it('includes admin.events.manage', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.events.manage');
  });

  it('includes admin.analytics.view', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.analytics.view');
  });

  it('includes admin.settings.manage', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.settings.manage');
  });

  it('includes admin.security.manage', () => {
    expect(ADMIN_PERMISSIONS).toContain('admin.security.manage');
  });

  it('all entries start with "admin."', () => {
    for (const perm of ADMIN_PERMISSIONS) {
      expect(perm).toMatch(/^admin\./);
    }
  });

  it('is an array', () => {
    expect(Array.isArray(ADMIN_PERMISSIONS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. adminUserSchema
// ---------------------------------------------------------------------------

describe('adminUserSchema', () => {
  it('accepts a valid admin user', () => {
    const result = adminUserSchema.safeParse(validAdminUser());
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const { id, ...noId } = validAdminUser();
    const result = adminUserSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = adminUserSchema.safeParse({ ...validAdminUser(), id: '' });
    expect(result.success).toBe(false);
  });

  it('rejects username shorter than 3 characters', () => {
    const result = adminUserSchema.safeParse({ ...validAdminUser(), username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects username longer than 30 characters', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      username: 'a'.repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it('rejects username with special characters', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      username: 'user@name',
    });
    expect(result.success).toBe(false);
  });

  it('accepts username with hyphens and underscores', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      username: 'user-name_123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      role: 'invalid_role',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid roles', () => {
    for (const role of ADMIN_ROLES) {
      const result = adminUserSchema.safeParse({ ...validAdminUser(), role });
      expect(result.success).toBe(true);
    }
  });

  it('accepts a valid handle', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      handle: 'myhandle123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects handle with hyphens', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      handle: 'my-handle',
    });
    expect(result.success).toBe(false);
  });

  it('rejects handle shorter than 3 characters', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      handle: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('requires passwordHash to be non-empty', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      passwordHash: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing passwordHash', () => {
    const { passwordHash, ...noHash } = validAdminUser();
    const result = adminUserSchema.safeParse(noHash);
    expect(result.success).toBe(false);
  });

  it('validates totpEnabled as boolean', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      totpEnabled: 'yes',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable totpSecretId', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      totpSecretId: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts string totpSecretId', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      totpSecretId: 'secret_abc',
    });
    expect(result.success).toBe(true);
  });

  it('validates createdAt as ISO datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      createdAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid createdAt datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      createdAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('validates updatedAt as ISO datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      updatedAt: '2024-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid updatedAt datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      updatedAt: '2024/01/15',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable lastLoginAt', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      lastLoginAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid lastLoginAt datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      lastLoginAt: 'yesterday',
    });
    expect(result.success).toBe(false);
  });

  it('validates isActive as boolean', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      isActive: 1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts legacy snake_case certificate_cn', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      certificate_cn: 'cn=legacy',
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy snake_case invited_by', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      invited_by: 'usr_legacy',
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy snake_case invitation_token', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      invitation_token: 'tok_legacy',
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy created_at datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      created_at: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid legacy created_at datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      created_at: 'bad-date',
    });
    expect(result.success).toBe(false);
  });

  it('accepts legacy last_login_at as null', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      last_login_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional permissions array', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      permissions: ['admin.access', 'admin.users.manage'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional invitationExpires datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      invitationExpires: LATER,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid invitationExpires datetime', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      invitationExpires: 'tomorrow',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable certificateCn', () => {
    const result = adminUserSchema.safeParse({
      ...validAdminUser(),
      certificateCn: null,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. createAdminUserSchema
// ---------------------------------------------------------------------------

describe('createAdminUserSchema', () => {
  it('accepts valid creation input', () => {
    const result = createAdminUserSchema.safeParse(validCreateInput());
    expect(result.success).toBe(true);
  });

  it('rejects missing username', () => {
    const { username, ...noUsername } = validCreateInput();
    const result = createAdminUserSchema.safeParse(noUsername);
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const { password, ...noPassword } = validCreateInput();
    const result = createAdminUserSchema.safeParse(noPassword);
    expect(result.success).toBe(false);
  });

  it('rejects missing role', () => {
    const { role, ...noRole } = validCreateInput();
    const result = createAdminUserSchema.safeParse(noRole);
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('accepts password of exactly 8 characters', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      password: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      role: 'unknown',
    });
    expect(result.success).toBe(false);
  });

  it('defaults totpEnabled to false when omitted', () => {
    const result = createAdminUserSchema.parse(validCreateInput());
    expect(result.totpEnabled).toBe(false);
  });

  it('accepts explicit totpEnabled true', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      totpEnabled: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totpEnabled).toBe(true);
    }
  });

  it('accepts optional handle', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      handle: 'myhandle',
    });
    expect(result.success).toBe(true);
  });

  it('rejects handle shorter than 3 characters', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      handle: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional permissions array', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      permissions: ['admin.access'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid roles', () => {
    for (const role of ADMIN_ROLES) {
      const result = createAdminUserSchema.safeParse({
        ...validCreateInput(),
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects username with spaces', () => {
    const result = createAdminUserSchema.safeParse({
      ...validCreateInput(),
      username: 'has space',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. updateAdminUserSchema
// ---------------------------------------------------------------------------

describe('updateAdminUserSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = updateAdminUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid partial update with username', () => {
    const result = updateAdminUserSchema.safeParse({ username: 'newname' });
    expect(result.success).toBe(true);
  });

  it('accepts valid partial update with role', () => {
    const result = updateAdminUserSchema.safeParse({ role: 'moderator' });
    expect(result.success).toBe(true);
  });

  it('accepts valid partial update with isActive', () => {
    const result = updateAdminUserSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });

  it('accepts valid partial update with totpEnabled', () => {
    const result = updateAdminUserSchema.safeParse({ totpEnabled: true });
    expect(result.success).toBe(true);
  });

  it('accepts valid partial update with password', () => {
    const result = updateAdminUserSchema.safeParse({ password: 'newpass12' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid username (too short)', () => {
    const result = updateAdminUserSchema.safeParse({ username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid username (too long)', () => {
    const result = updateAdminUserSchema.safeParse({
      username: 'a'.repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid username (special chars)', () => {
    const result = updateAdminUserSchema.safeParse({ username: 'bad@name' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = updateAdminUserSchema.safeParse({ role: 'superuser' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = updateAdminUserSchema.safeParse({ password: 'short' });
    expect(result.success).toBe(false);
  });

  it('accepts valid handle', () => {
    const result = updateAdminUserSchema.safeParse({ handle: 'myhandle' });
    expect(result.success).toBe(true);
  });

  it('accepts permissions array', () => {
    const result = updateAdminUserSchema.safeParse({
      permissions: ['admin.access', 'admin.content.manage'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple fields at once', () => {
    const result = updateAdminUserSchema.safeParse({
      username: 'updated',
      role: 'editor',
      isActive: true,
      totpEnabled: false,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. adminActivityLogSchema
// ---------------------------------------------------------------------------

describe('adminActivityLogSchema', () => {
  it('accepts a valid activity log', () => {
    const result = adminActivityLogSchema.safeParse(validActivityLog());
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const { id, ...noId } = validActivityLog();
    const result = adminActivityLogSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      id: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing adminUserId', () => {
    const { adminUserId, ...noUserId } = validActivityLog();
    const result = adminActivityLogSchema.safeParse(noUserId);
    expect(result.success).toBe(false);
  });

  it('rejects missing action', () => {
    const { action, ...noAction } = validActivityLog();
    const result = adminActivityLogSchema.safeParse(noAction);
    expect(result.success).toBe(false);
  });

  it('rejects empty action', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      action: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing resourceType', () => {
    const { resourceType, ...noType } = validActivityLog();
    const result = adminActivityLogSchema.safeParse(noType);
    expect(result.success).toBe(false);
  });

  it('accepts null resourceId', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      resourceId: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null ipAddress', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      ipAddress: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null userAgent', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      userAgent: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null details', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      details: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional adminUsername', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      adminUsername: 'admin_user',
    });
    expect(result.success).toBe(true);
  });

  it('validates createdAt as ISO datetime', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      createdAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('accepts legacy admin_user_id field', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      admin_user_id: 'usr_legacy',
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy resource_type field', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      resource_type: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy resource_id field as null', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      resource_id: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy ip_address field as null', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      ip_address: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy user_agent field as null', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      user_agent: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts legacy created_at datetime', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      created_at: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid legacy created_at datetime', () => {
    const result = adminActivityLogSchema.safeParse({
      ...validActivityLog(),
      created_at: 'bad',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. sanitizeAdminUser
// ---------------------------------------------------------------------------

describe('sanitizeAdminUser', () => {
  it('removes passwordHash from the result', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      passwordHash: '$2b$10$secret',
      totpSecretId: 'totp_123',
    };
    const sanitized = sanitizeAdminUser(user);
    expect('passwordHash' in sanitized).toBe(false);
  });

  it('removes totpSecretId from the result', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      passwordHash: '$2b$10$secret',
      totpSecretId: 'totp_123',
    };
    const sanitized = sanitizeAdminUser(user);
    expect('totpSecretId' in sanitized).toBe(false);
  });

  it('preserves the id field', () => {
    const user: AdminUser = {
      id: 'usr_42',
      username: 'test',
      role: 'admin',
      passwordHash: 'hash',
      totpSecretId: 'sid',
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.id).toBe('usr_42');
  });

  it('preserves the username field', () => {
    const user: AdminUser = {
      id: '1',
      username: 'myname',
      role: 'admin',
      passwordHash: 'hash',
      totpSecretId: null,
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.username).toBe('myname');
  });

  it('preserves the role field', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'moderator',
      passwordHash: 'hash',
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.role).toBe('moderator');
  });

  it('preserves optional fields', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      passwordHash: 'hash',
      displayName: 'Test User',
      email: 'test@example.com',
      isActive: true,
      permissions: ['admin.access'],
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.displayName).toBe('Test User');
    expect(sanitized.email).toBe('test@example.com');
    expect(sanitized.isActive).toBe(true);
    expect(sanitized.permissions).toEqual(['admin.access']);
  });

  it('returns a new object (does not mutate the original)', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      passwordHash: 'hash',
      totpSecretId: 'sid',
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized).not.toBe(user);
    expect(user.passwordHash).toBe('hash');
    expect(user.totpSecretId).toBe('sid');
  });

  it('works with minimal AdminUser (no optional fields)', () => {
    const user: AdminUser = {
      id: '1',
      username: 'minimal',
      role: 'viewer',
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.id).toBe('1');
    expect(sanitized.username).toBe('minimal');
    expect(sanitized.role).toBe('viewer');
  });

  it('handles null totpSecretId without error', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      passwordHash: 'hash',
      totpSecretId: null,
    };
    const sanitized = sanitizeAdminUser(user);
    expect('totpSecretId' in sanitized).toBe(false);
  });

  it('preserves legacy fields', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      passwordHash: 'hash',
      certificate_cn: 'cn=legacy',
      invited_by: 'usr_legacy',
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.certificate_cn).toBe('cn=legacy');
    expect(sanitized.invited_by).toBe('usr_legacy');
  });

  it('preserves profile and preference fields', () => {
    const user: AdminUser = {
      id: '1',
      username: 'test',
      role: 'admin',
      bio: 'Hello world',
      pronouns: 'they/them',
      socialLinks: { twitter: '@test' },
      preferences: { theme: 'dark', timezone: 'UTC' },
    };
    const sanitized = sanitizeAdminUser(user);
    expect(sanitized.bio).toBe('Hello world');
    expect(sanitized.pronouns).toBe('they/them');
    expect(sanitized.socialLinks).toEqual({ twitter: '@test' });
    expect(sanitized.preferences).toEqual({ theme: 'dark', timezone: 'UTC' });
  });
});

// ---------------------------------------------------------------------------
// 9. Validation functions
// ---------------------------------------------------------------------------

describe('validateAdminUser', () => {
  it('returns parsed data for a valid user', () => {
    const result = validateAdminUser(validAdminUser());
    expect(result.id).toBe('usr_abc123');
    expect(result.username).toBe('testadmin');
  });

  it('throws ZodError for invalid data', () => {
    expect(() => validateAdminUser({})).toThrow(ZodError);
  });

  it('throws ZodError with field-level issues', () => {
    try {
      validateAdminUser({ id: '', username: 'ab' });
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      const zodErr = err as ZodError;
      const paths = zodErr.issues.map((i) => i.path[0]);
      expect(paths).toContain('id');
    }
  });
});

describe('validateCreateAdminUser', () => {
  it('returns parsed data for valid input', () => {
    const result = validateCreateAdminUser(validCreateInput());
    expect(result.username).toBe('newuser');
    expect(result.password).toBe('securepass123');
    expect(result.role).toBe('editor');
    expect(result.totpEnabled).toBe(false);
  });

  it('throws ZodError for missing required fields', () => {
    expect(() => validateCreateAdminUser({})).toThrow(ZodError);
  });

  it('throws ZodError for password too short', () => {
    expect(() =>
      validateCreateAdminUser({ ...validCreateInput(), password: 'short' }),
    ).toThrow(ZodError);
  });

  it('throws ZodError for invalid role', () => {
    expect(() =>
      validateCreateAdminUser({ ...validCreateInput(), role: 'boss' }),
    ).toThrow(ZodError);
  });

  it('preserves explicit totpEnabled value', () => {
    const result = validateCreateAdminUser({
      ...validCreateInput(),
      totpEnabled: true,
    });
    expect(result.totpEnabled).toBe(true);
  });
});

describe('validateUpdateAdminUser', () => {
  it('returns parsed data for valid partial update', () => {
    const result = validateUpdateAdminUser({ username: 'updated' });
    expect(result.username).toBe('updated');
  });

  it('returns empty object for empty input', () => {
    const result = validateUpdateAdminUser({});
    expect(result).toEqual({});
  });

  it('throws ZodError for invalid username', () => {
    expect(() => validateUpdateAdminUser({ username: 'a' })).toThrow(ZodError);
  });

  it('throws ZodError for invalid role', () => {
    expect(() => validateUpdateAdminUser({ role: 'manager' })).toThrow(
      ZodError,
    );
  });

  it('throws ZodError for short password', () => {
    expect(() => validateUpdateAdminUser({ password: '123' })).toThrow(
      ZodError,
    );
  });
});

describe('validateActivityLog', () => {
  it('returns parsed data for a valid log', () => {
    const result = validateActivityLog(validActivityLog());
    expect(result.id).toBe('log_001');
    expect(result.action).toBe('user_created');
  });

  it('throws ZodError for empty object', () => {
    expect(() => validateActivityLog({})).toThrow(ZodError);
  });

  it('throws ZodError for missing required fields', () => {
    expect(() =>
      validateActivityLog({ id: '1', adminUserId: '2' }),
    ).toThrow(ZodError);
  });

  it('throws ZodError for invalid createdAt', () => {
    expect(() =>
      validateActivityLog({ ...validActivityLog(), createdAt: 'bad-date' }),
    ).toThrow(ZodError);
  });

  it('accepts log with all legacy fields populated', () => {
    const result = validateActivityLog({
      ...validActivityLog(),
      admin_user_id: 'usr_legacy',
      resource_type: 'user',
      resource_id: null,
      ip_address: null,
      user_agent: null,
      created_at: NOW,
    });
    expect(result.id).toBe('log_001');
  });
});
