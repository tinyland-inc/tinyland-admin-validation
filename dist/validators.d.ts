import type { AdminUser, AdminActivityLog } from './types.js';
export declare function sanitizeAdminUser(user: AdminUser): Omit<AdminUser, 'passwordHash' | 'totpSecretId'>;
export declare function validateActivityLog(log: unknown): AdminActivityLog;
export declare function validateAdminUser(user: unknown): AdminUser;
export declare function validateCreateAdminUser(data: unknown): {
    username: string;
    totpEnabled: boolean;
    role: "super_admin" | "admin" | "moderator" | "editor" | "event_manager" | "contributor" | "viewer";
    password: string;
    handle?: string | undefined;
    permissions?: string[] | undefined;
};
export declare function validateUpdateAdminUser(data: unknown): {
    username?: string | undefined;
    handle?: string | undefined;
    totpEnabled?: boolean | undefined;
    isActive?: boolean | undefined;
    role?: "super_admin" | "admin" | "moderator" | "editor" | "event_manager" | "viewer" | undefined;
    permissions?: string[] | undefined;
    password?: string | undefined;
};
//# sourceMappingURL=validators.d.ts.map