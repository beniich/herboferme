
// lib/rbac/permissions.ts

export enum Permission {
    // Complaints
    VIEW_COMPLAINTS = 'view:complaints',
    CREATE_COMPLAINT = 'create:complaint',
    EDIT_COMPLAINT = 'edit:complaint',
    DELETE_COMPLAINT = 'delete:complaint',
    ASSIGN_COMPLAINT = 'assign:complaint',
    RESOLVE_COMPLAINT = 'resolve:complaint',

    // Teams
    VIEW_TEAMS = 'view:teams',
    MANAGE_TEAMS = 'manage:teams',
    ASSIGN_TEAM_MEMBERS = 'assign:team_members',

    // Inventory
    VIEW_INVENTORY = 'view:inventory',
    MANAGE_INVENTORY = 'manage:inventory',
    APPROVE_REQUISITIONS = 'approve:requisitions',
    CREATE_REQUISITION = 'create:requisition',

    // Analytics
    VIEW_ANALYTICS = 'view:analytics',
    EXPORT_DATA = 'export:data',

    // Users & Admin
    VIEW_USERS = 'view:users',
    MANAGE_USERS = 'manage:users',
    MANAGE_ROLES = 'manage:roles',
    VIEW_AUDIT_LOGS = 'view:audit_logs',
    SYSTEM_SETTINGS = 'system:settings',
}

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    DISPATCHER = 'DISPATCHER', // Legacy/Alias
    TECHNICIAN = 'TECHNICIAN',
    TECHNIQUE = 'TECHNIQUE', // Legacy/Alias
    USER = 'USER',
    CITIZEN = 'CITIZEN', // Legacy/Alias
    VIEWER = 'VIEWER',
    WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER', // Legacy
}

// Role Hierarchy
export const ROLE_HIERARCHY: Record<Role, number> = {
    [Role.SUPER_ADMIN]: 100,
    [Role.OWNER]: 90,
    [Role.ADMIN]: 80,
    [Role.MANAGER]: 60,
    [Role.DISPATCHER]: 60,
    [Role.WAREHOUSE_MANAGER]: 50,
    [Role.TECHNICIAN]: 40,
    [Role.TECHNIQUE]: 40,
    [Role.USER]: 20,
    [Role.CITIZEN]: 20,
    [Role.VIEWER]: 10,
};

const DATA_ADMIN_PERMS = [
    Permission.VIEW_COMPLAINTS,
    Permission.CREATE_COMPLAINT,
    Permission.EDIT_COMPLAINT,
    Permission.DELETE_COMPLAINT,
    Permission.ASSIGN_COMPLAINT,
    Permission.RESOLVE_COMPLAINT,
    Permission.VIEW_TEAMS,
    Permission.MANAGE_TEAMS,
    Permission.ASSIGN_TEAM_MEMBERS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.APPROVE_REQUISITIONS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
];

const MANAGER_PERMS = [
    Permission.VIEW_COMPLAINTS,
    Permission.CREATE_COMPLAINT,
    Permission.EDIT_COMPLAINT,
    Permission.ASSIGN_COMPLAINT,
    Permission.RESOLVE_COMPLAINT,
    Permission.VIEW_TEAMS,
    Permission.ASSIGN_TEAM_MEMBERS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.APPROVE_REQUISITIONS,
    Permission.CREATE_REQUISITION,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
];

const TECH_PERMS = [
    Permission.VIEW_COMPLAINTS,
    Permission.EDIT_COMPLAINT,
    Permission.VIEW_TEAMS,
    Permission.VIEW_INVENTORY,
    Permission.CREATE_REQUISITION,
];

const USER_PERMS = [
    Permission.VIEW_COMPLAINTS,
    Permission.CREATE_COMPLAINT,
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: Object.values(Permission),
    [Role.OWNER]: Object.values(Permission),

    [Role.ADMIN]: DATA_ADMIN_PERMS,

    [Role.MANAGER]: MANAGER_PERMS,
    [Role.DISPATCHER]: MANAGER_PERMS,

    [Role.WAREHOUSE_MANAGER]: [
        Permission.VIEW_COMPLAINTS,
        Permission.VIEW_INVENTORY,
        Permission.MANAGE_INVENTORY,
        Permission.APPROVE_REQUISITIONS,
        Permission.CREATE_REQUISITION,
    ],

    [Role.TECHNICIAN]: TECH_PERMS,
    [Role.TECHNIQUE]: TECH_PERMS,

    [Role.USER]: USER_PERMS,
    [Role.CITIZEN]: USER_PERMS,

    [Role.VIEWER]: [
        Permission.VIEW_COMPLAINTS,
        Permission.VIEW_TEAMS,
        Permission.VIEW_INVENTORY,
        Permission.VIEW_ANALYTICS,
    ],
};

// V  rification des permissions
export function hasPermission(userRole: Role | string, permission: Permission): boolean {
    const roleKey = userRole as Role;
    const permissions = ROLE_PERMISSIONS[roleKey] || [];
    return permissions.includes(permission);
}

export function hasAnyPermission(userRole: Role | string, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: Role | string, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(userRole, permission));
}

export function isRoleHigherOrEqual(userRole: Role | string, targetRole: Role): boolean {
    const roleKey = userRole as Role;
    return (ROLE_HIERARCHY[roleKey] || 0) >= (ROLE_HIERARCHY[targetRole] || 0);
}
