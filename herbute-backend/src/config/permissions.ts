/**
 * ═══════════════════════════════════════════════════════
 * config/permissions.ts — RBAC (Role-Based Access Control)
 * Production-ready permission system (SOC2 compliant)
 * ═══════════════════════════════════════════════════════
 */

// ─── Permission Enum (type-safe strings) ────────────────
export enum Permission {
  // 🐄 Animals
  ANIMALS_READ   = 'animals:read',
  ANIMALS_CREATE = 'animals:create',
  ANIMALS_UPDATE = 'animals:update',
  ANIMALS_DELETE = 'animals:delete',

  // 🌾 Crops
  CROPS_READ   = 'crops:read',
  CROPS_CREATE = 'crops:create',
  CROPS_UPDATE = 'crops:update',
  CROPS_DELETE = 'crops:delete',

  // 💧 Irrigation
  IRRIGATION_READ   = 'irrigation:read',
  IRRIGATION_CREATE = 'irrigation:create',
  IRRIGATION_UPDATE = 'irrigation:update',

  // 💰 Finance
  FINANCE_READ   = 'finance:read',
  FINANCE_CREATE = 'finance:create',
  FINANCE_UPDATE = 'finance:update',
  FINANCE_DELETE = 'finance:delete',

  // 🖥️ IT (tickets, assets)
  IT_READ   = 'it:read',
  IT_CREATE = 'it:create',
  IT_UPDATE = 'it:update',
  IT_DELETE = 'it:delete',

  // 🧾 Billing (abonnements Stripe)
  BILLING_READ   = 'billing:read',
  BILLING_MANAGE = 'billing:manage',

  // 👥 HR / Staff
  HR_READ   = 'hr:read',
  HR_CREATE = 'hr:create',
  HR_UPDATE = 'hr:update',
  HR_DELETE = 'hr:delete',

  // 📦 Inventory
  INVENTORY_READ   = 'inventory:read',
  INVENTORY_MANAGE = 'inventory:manage',

  // 🔧 Admin
  ADMIN_USERS    = 'admin:users',
  ADMIN_BILLING  = 'admin:billing',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_AUDIT    = 'admin:audit',
  ADMIN_SECURITY = 'admin:security',

  // 📊 Analytics
  ANALYTICS_READ = 'analytics:read',
}

// ─── Role → Permissions mapping ─────────────────────────
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // 👤 Employé / Ouvrier agricole — lecture uniquement
  employe: [
    Permission.ANIMALS_READ,
    Permission.CROPS_READ,
    Permission.IRRIGATION_READ,
    Permission.INVENTORY_READ,
    Permission.HR_READ,
  ],

  // 🌱 Vétérinaire — accès animaux + santé
  veterinaire: [
    Permission.ANIMALS_READ,
    Permission.ANIMALS_CREATE,
    Permission.ANIMALS_UPDATE,
    Permission.CROPS_READ,
    Permission.INVENTORY_READ,
  ],

  // 💼 Comptable — finance uniquement
  comptable: [
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.BILLING_READ,
    Permission.ANALYTICS_READ,
  ],

  // 🔑 Manager — gestion complète sauf admin système
  manager: [
    Permission.ANIMALS_READ,
    Permission.ANIMALS_CREATE,
    Permission.ANIMALS_UPDATE,
    Permission.CROPS_READ,
    Permission.CROPS_CREATE,
    Permission.CROPS_UPDATE,
    Permission.IRRIGATION_READ,
    Permission.IRRIGATION_CREATE,
    Permission.IRRIGATION_UPDATE,
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_MANAGE,
    Permission.HR_READ,
    Permission.HR_CREATE,
    Permission.HR_UPDATE,
    Permission.IT_READ,
    Permission.IT_CREATE,
    Permission.ANALYTICS_READ,
  ],

  // 🛡️ Admin — tous droits sauf super_admin
  admin: Object.values(Permission).filter(
    p => p !== Permission.ADMIN_SECURITY
  ),

  // 👑 Super Admin — accès total (toutes permissions)
  super_admin: Object.values(Permission),

  // 🔑 Alias (legacy → mapping)
  user: [Permission.ANIMALS_READ, Permission.CROPS_READ],
};

// ─── Helper: vérifier les permissions d'un rôle ─────────
export function getPermissionsForRoles(roles: string[]): Set<Permission> {
  const perms = new Set<Permission>();
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    rolePerms.forEach(p => perms.add(p));
  }
  return perms;
}

export function hasPermission(
  userRoles: string[],
  ...requiredPerms: Permission[]
): boolean {
  const userPerms = getPermissionsForRoles(userRoles);
  return requiredPerms.every(p => userPerms.has(p));
}
