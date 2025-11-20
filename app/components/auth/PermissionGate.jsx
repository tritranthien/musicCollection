// app/components/auth/PermissionGate.jsx
// Component để ẩn/hiện UI dựa trên permissions

/**
 * PermissionGate - Chỉ render children nếu user có permission
 * 
 * Usage:
 * <PermissionGate permission="canCreate">
 *   <button>Create</button>
 * </PermissionGate>
 */
export function PermissionGate({ permission, permissions, children, fallback = null }) {
    if (!permissions || !permissions[permission]) {
        return fallback;
    }

    return <>{children}</>;
}

/**
 * RoleGate - Chỉ render children nếu user có role phù hợp
 * 
 * Usage:
 * <RoleGate roles={['ADMIN', 'MANAGER']}>
 *   <button>Admin Only</button>
 * </RoleGate>
 */
export function RoleGate({ roles = [], permissions, children, fallback = null }) {
    if (!permissions) return fallback;

    const hasRole = roles.some(role => {
        const roleKey = `is${role.charAt(0) + role.slice(1).toLowerCase()}`;
        return permissions[roleKey];
    });

    if (!hasRole) return fallback;

    return <>{children}</>;
}

/**
 * ResourcePermissionGate - Chỉ render nếu có permission cho resource cụ thể
 * 
 * Usage:
 * <ResourcePermissionGate permission="canUpdate" resourcePermissions={resourcePerms}>
 *   <button>Edit</button>
 * </ResourcePermissionGate>
 */
export function ResourcePermissionGate({
    permission,
    resourcePermissions,
    children,
    fallback = null
}) {
    if (!resourcePermissions || !resourcePermissions[permission]) {
        return fallback;
    }

    return <>{children}</>;
}

/**
 * OwnerGate - Chỉ render nếu user là owner hoặc ADMIN/MANAGER
 * 
 * Usage:
 * <OwnerGate resourcePermissions={resourcePerms}>
 *   <button>Delete</button>
 * </OwnerGate>
 */
export function OwnerGate({ resourcePermissions, permissions, children, fallback = null }) {
    if (!resourcePermissions && !permissions) return fallback;

    // Nếu là owner hoặc ADMIN/MANAGER
    const canAccess = resourcePermissions?.isOwner ||
        permissions?.isAdmin ||
        permissions?.isManager;

    if (!canAccess) return fallback;

    return <>{children}</>;
}

/**
 * StudentGate - Chỉ render nếu user KHÔNG phải STUDENT
 * 
 * Usage:
 * <StudentGate permissions={permissions}>
 *   <button>Upload</button>
 * </StudentGate>
 */
export function StudentGate({ permissions, children, fallback = null }) {
    if (!permissions || permissions.isStudent) {
        return fallback;
    }

    return <>{children}</>;
}
