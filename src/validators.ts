








import type { AdminUser, AdminActivityLog } from './types.js';
import {
  adminUserSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  adminActivityLogSchema,
} from './schemas.js';








export function sanitizeAdminUser(
  user: AdminUser,
): Omit<AdminUser, 'passwordHash' | 'totpSecretId'> {
  const { passwordHash, totpSecretId, ...sanitized } = user;
  return sanitized;
}








export function validateActivityLog(log: unknown): AdminActivityLog {
  return adminActivityLogSchema.parse(log) as AdminActivityLog;
}








export function validateAdminUser(user: unknown): AdminUser {
  return adminUserSchema.parse(user) as AdminUser;
}








export function validateCreateAdminUser(data: unknown) {
  return createAdminUserSchema.parse(data);
}








export function validateUpdateAdminUser(data: unknown) {
  return updateAdminUserSchema.parse(data);
}
