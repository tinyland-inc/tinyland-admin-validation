/**
 * @tinyland-inc/tinyland-admin-validation
 *
 * Framework-agnostic Zod validation schemas and utilities for admin user management.
 * Extracted from the tinyland.dev monorepo for standalone use.
 *
 * @example
 * ```typescript
 * import {
 *   validateCreateAdminUser,
 *   sanitizeAdminUser,
 *   ADMIN_ROLES,
 *   ADMIN_PERMISSIONS,
 * } from '@tinyland-inc/tinyland-admin-validation';
 *
 * const parsed = validateCreateAdminUser({
 *   username: 'newadmin',
 *   password: 'securepass123',
 *   role: 'editor',
 * });
 * ```
 *
 * @module @tinyland-inc/tinyland-admin-validation
 */

// Types
export type { AdminUser, AdminActivityLog, AdminPermission } from './types.js';

// Schemas and constants
export {
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  adminUserSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  adminActivityLogSchema,
} from './schemas.js';

// Validation and sanitization functions
export {
  sanitizeAdminUser,
  validateActivityLog,
  validateAdminUser,
  validateCreateAdminUser,
  validateUpdateAdminUser,
} from './validators.js';
