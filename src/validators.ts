/**
 * Validation and sanitization functions for admin entities
 *
 * Provides runtime validation using Zod schemas and a sanitization
 * utility that strips sensitive fields before sending to clients.
 *
 * @module @tinyland-inc/tinyland-admin-validation/validators
 */

import type { AdminUser, AdminActivityLog } from './types.js';
import {
  adminUserSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  adminActivityLogSchema,
} from './schemas.js';

/**
 * Sanitizes admin user data for client consumption.
 * Removes sensitive fields: passwordHash and totpSecretId.
 *
 * @param user - The full admin user object
 * @returns A new object without passwordHash or totpSecretId
 */
export function sanitizeAdminUser(
  user: AdminUser,
): Omit<AdminUser, 'passwordHash' | 'totpSecretId'> {
  const { passwordHash, totpSecretId, ...sanitized } = user;
  return sanitized;
}

/**
 * Validates an admin activity log entry against the schema.
 *
 * @param log - The raw log data to validate
 * @returns The validated AdminActivityLog object
 * @throws {ZodError} If validation fails
 */
export function validateActivityLog(log: unknown): AdminActivityLog {
  return adminActivityLogSchema.parse(log) as AdminActivityLog;
}

/**
 * Validates admin user data against the full user schema.
 *
 * @param user - The raw user data to validate
 * @returns The validated AdminUser object
 * @throws {ZodError} If validation fails
 */
export function validateAdminUser(user: unknown): AdminUser {
  return adminUserSchema.parse(user) as AdminUser;
}

/**
 * Validates input data for creating a new admin user.
 *
 * @param data - The raw creation data to validate
 * @returns The validated and parsed creation data
 * @throws {ZodError} If validation fails
 */
export function validateCreateAdminUser(data: unknown) {
  return createAdminUserSchema.parse(data);
}

/**
 * Validates input data for updating an existing admin user.
 *
 * @param data - The raw update data to validate
 * @returns The validated and parsed update data
 * @throws {ZodError} If validation fails
 */
export function validateUpdateAdminUser(data: unknown) {
  return updateAdminUserSchema.parse(data);
}
