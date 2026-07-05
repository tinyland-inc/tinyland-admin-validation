import { describe, it, expect } from 'vitest';
import { ADMIN_ROLES, ADMIN_PERMISSIONS } from '../src/index.js';

// TIN-2435: ADMIN_ROLES and ADMIN_PERMISSIONS in this package must never
// drift from the ratified vocabulary in @tummycrypt/tinyland-auth v0.4.0.
// This package cannot import runtime values from @tummycrypt/tinyland-auth
// outside the Bazel module graph (it is only linked as a Bazel npm_link
// dependency, not an npm dependency of this package -- see MODULE.bazel /
// BUILD.bazel), so the authority's ADMIN_ROLES is transcribed here by hand
// from tinyland-auth src/types/auth.ts as of v0.4.0. If tinyland-auth's
// role vocabulary changes, this transcription -- and ADMIN_ROLES above --
// must be updated together.
const AUTH_ADMIN_ROLES_V0_4_0 = [
  'super_admin',
  'admin',
  'moderator',
  'editor',
  'event_manager',
  'contributor',
  'member',
  'viewer',
];

describe('vocabulary alignment with @tummycrypt/tinyland-auth v0.4.0 (TIN-2435)', () => {
  it('ADMIN_ROLES matches the authority ADMIN_ROLES exactly (8 roles, includes member)', () => {
    expect([...ADMIN_ROLES].sort()).toEqual([...AUTH_ADMIN_ROLES_V0_4_0].sort());
    expect(ADMIN_ROLES).toHaveLength(8);
    expect(ADMIN_ROLES).toContain('member');
  });

  it('ADMIN_PERMISSIONS contains no dead strings absent from the authority vocabulary', () => {
    // The authority's 21-permission set (src/types/permissions.ts
    // AdminPermission in tinyland-auth). This package validates a subset;
    // every entry here must also be a member of the authority set.
    const AUTHORITY_PERMISSIONS = [
      'admin.access',
      'admin.users.view',
      'admin.users.manage',
      'admin.users.delete',
      'admin.content.view',
      'admin.content.publish',
      'admin.content.media_create',
      'admin.content.manage',
      'admin.content.moderate',
      'admin.content.delete',
      'admin.events.view',
      'admin.events.manage',
      'admin.events.delete',
      'admin.analytics.view',
      'admin.analytics.export',
      'admin.settings.view',
      'admin.settings.manage',
      'admin.security.view',
      'admin.security.manage',
      'admin.logs.view',
      'admin.logs.export',
    ];

    for (const perm of ADMIN_PERMISSIONS) {
      expect(AUTHORITY_PERMISSIONS).toContain(perm);
    }

    // The dead string dropped by TIN-2435 must not reappear.
    expect(ADMIN_PERMISSIONS).not.toContain('admin.users.moderate');
  });
});
