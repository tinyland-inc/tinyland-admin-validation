/**
 * Admin validation types - internalized from the monorepo
 *
 * These types define the shape of admin entities for validation purposes.
 * The AdminUser interface here is the app-specific variant with username/password schema.
 *
 * @module @tinyland-inc/tinyland-admin-validation/types
 */

/**
 * Admin permission strings for granular access control
 */
export type AdminPermission =
  | 'admin.access'
  | 'admin.users.manage'
  | 'admin.users.moderate'
  | 'admin.content.manage'
  | 'admin.content.moderate'
  | 'admin.events.manage'
  | 'admin.analytics.view'
  | 'admin.settings.manage'
  | 'admin.security.manage';

/**
 * AdminUser interface - App-specific with username/password schema
 *
 * NOTE: This differs from @tinyland/auth's AdminUser which uses handle/passwordHash.
 * This interface is for the app's internal user management with SvelteKit.
 *
 * All field names use consistent camelCase convention for:
 * - Better TypeScript/JavaScript alignment
 * - Consistent API contracts
 * - Easier refactoring and maintenance
 */
export interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  name?: string;
  handle?: string;
  email?: string;
  password?: string;
  passwordHash?: string;
  totpSecret?: string | null;
  totpSecretId?: string | null;
  totpEnabled?: boolean;
  tempPassword?: string;
  qrCode?: string;
  totpUri?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  lastLogin?: string;
  isActive?: boolean;
  firstLogin?: boolean;
  needsOnboarding?: boolean;
  onboardingStep?: number;
  role: string;
  permissions?: string[];
  certificateCn?: string;
  invitedBy?: string;
  invitationToken?: string;
  invitationExpires?: string;
  profileVisibility?: 'private' | 'draft' | 'public';
  profilePhoto?: string;
  bio?: string;
  pronouns?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    theme?: string;
    timezone?: string;
    contentPageSettings?: {
      forceTheme: string | null;
      forceDarkMode: 'light' | 'dark' | null;
      forceA11y: boolean;
    };
  };
  backupCodes?: string[];
  /** @deprecated Use certificateCn instead */
  certificate_cn?: string;
  /** @deprecated Use invitedBy instead */
  invited_by?: string;
  /** @deprecated Use invitationToken instead */
  invitation_token?: string;
}

/**
 * AdminActivityLog interface - Standardized camelCase naming
 *
 * Activity log entries for auditing admin actions.
 */
export interface AdminActivityLog {
  id: string;
  adminUserId: string;
  adminUsername?: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: any | null;
  createdAt: string;
  /** @deprecated Use adminUserId instead */
  admin_user_id?: string;
  /** @deprecated Use resourceType instead */
  resource_type?: string;
  /** @deprecated Use resourceId instead */
  resource_id?: string | null;
  /** @deprecated Use ipAddress instead */
  ip_address?: string | null;
  /** @deprecated Use userAgent instead */
  user_agent?: string | null;
  /** @deprecated Use createdAt instead */
  created_at?: string;
}
