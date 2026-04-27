import type { AdminUser, AdminActivityLog } from './types.js';
export declare function sanitizeAdminUser(user: AdminUser): Omit<AdminUser, 'passwordHash' | 'totpSecretId'>;
export declare function validateActivityLog(log: unknown): AdminActivityLog;
export declare function validateAdminUser(user: unknown): AdminUser;
export declare function validateCreateAdminUser(data: unknown): any;
export declare function validateUpdateAdminUser(data: unknown): any;
//# sourceMappingURL=validators.d.ts.map