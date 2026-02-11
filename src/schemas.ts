/**
 * Zod validation schemas for admin user management
 *
 * Provides schemas for validating admin users, creation/update operations,
 * and activity log entries. Includes backward compatibility for legacy
 * snake_case field names during migration.
 *
 * @module @tinyland-inc/tinyland-admin-validation/schemas
 */

import { z } from 'zod';
import type { AdminRole } from '@tinyland-inc/tinyland-auth';
import type { AdminPermission } from './types.js';

/**
 * Admin roles array - matches AdminRole type from @tinyland-inc/tinyland-auth
 * Note: excludes 'member' role which is not used in admin validation context
 */
export const ADMIN_ROLES: AdminRole[] = [
  'super_admin',
  'admin',
  'moderator',
  'editor',
  'event_manager',
  'contributor',
  'viewer',
];

/**
 * Admin permissions array - all valid permission strings
 */
export const ADMIN_PERMISSIONS: AdminPermission[] = [
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

/**
 * Validation schema for a full admin user record.
 * Includes camelCase fields and legacy snake_case backward-compat fields.
 */
export const adminUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_\-]+$/),
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  passwordHash: z.string().min(1),
  totpSecretId: z.string().nullable(),
  totpEnabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
  isActive: z.boolean(),
  role: z.enum([
    'super_admin',
    'admin',
    'moderator',
    'editor',
    'event_manager',
    'contributor',
    'viewer',
  ]),
  certificateCn: z.string().nullable().optional(),
  permissions: z.array(z.string()).optional(),
  invitedBy: z.string().optional(),
  invitationToken: z.string().optional(),
  invitationExpires: z.string().datetime().optional(),
  // Allow legacy fields for backward compatibility during migration
  certificate_cn: z.string().nullable().optional(),
  invited_by: z.string().optional(),
  invitation_token: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  last_login_at: z.string().datetime().nullable().optional(),
});

/**
 * Validation schema for creating a new admin user.
 */
export const createAdminUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_\-]+$/),
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  password: z.string().min(8),
  role: z.enum([
    'super_admin',
    'admin',
    'moderator',
    'editor',
    'event_manager',
    'contributor',
    'viewer',
  ]),
  totpEnabled: z.boolean().optional().default(false),
  permissions: z.array(z.string()).optional(),
});

/**
 * Validation schema for updating an existing admin user.
 * All fields are optional since updates can be partial.
 */
export const updateAdminUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_\-]+$/).optional(),
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  password: z.string().min(8).optional(),
  role: z
    .enum([
      'super_admin',
      'admin',
      'editor',
      'event_manager',
      'moderator',
      'viewer',
    ])
    .optional(),
  isActive: z.boolean().optional(),
  totpEnabled: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Validation schema for admin activity log entries.
 * Includes camelCase fields and legacy snake_case backward-compat fields.
 */
export const adminActivityLogSchema = z.object({
  id: z.string().min(1),
  adminUserId: z.string().min(1),
  adminUsername: z.string().optional(),
  action: z.string().min(1),
  resourceType: z.string().min(1),
  resourceId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  details: z.any().nullable(),
  createdAt: z.string().datetime(),
  // Allow legacy fields for backward compatibility during migration
  admin_user_id: z.string().min(1).optional(),
  resource_type: z.string().min(1).optional(),
  resource_id: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});
