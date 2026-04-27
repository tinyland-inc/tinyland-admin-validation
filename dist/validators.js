import { adminUserSchema, createAdminUserSchema, updateAdminUserSchema, adminActivityLogSchema, } from './schemas.js';
export function sanitizeAdminUser(user) {
    const { passwordHash, totpSecretId, ...sanitized } = user;
    return sanitized;
}
export function validateActivityLog(log) {
    return adminActivityLogSchema.parse(log);
}
export function validateAdminUser(user) {
    return adminUserSchema.parse(user);
}
export function validateCreateAdminUser(data) {
    return createAdminUserSchema.parse(data);
}
export function validateUpdateAdminUser(data) {
    return updateAdminUserSchema.parse(data);
}
