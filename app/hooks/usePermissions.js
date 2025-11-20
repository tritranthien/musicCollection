// app/hooks/usePermissions.js
// Hook để lấy permissions từ loaderData

import { useRouteLoaderData } from "react-router";

/**
 * Hook để lấy user permissions từ Dashboard loader
 * 
 * Dashboard route có id="dashboard" trong routes.ts
 * Loader trả về: { user, permissions, menuList, ... }
 * 
 * Usage trong component:
 * const permissions = usePermissions();
 * 
 * if (permissions.canCreate) {
 *   // Show create button
 * }
 */
export function usePermissions() {
    // Lấy data từ dashboard route (id="dashboard")
    const data = useRouteLoaderData("dashboard");

    return data?.permissions || {
        canCreate: false,
        canView: false,
        canManageUsers: false,
        canChangeRoles: false,
        isAdmin: false,
        isManager: false,
        isTeacher: false,
        isStudent: true, // Default to most restrictive
    };
}

/**
 * Hook để lấy user info
 */
export function useUser() {
    const data = useRouteLoaderData("dashboard");
    return data?.user || null;
}

/**
 * Hook để check role
 */
export function useRole() {
    const user = useUser();
    return {
        isAdmin: user?.role === "ADMIN",
        isManager: user?.role === "MANAGER",
        isTeacher: user?.role === "TEACHER",
        isStudent: user?.role === "STUDENT",
        role: user?.role || null,
    };
}

/**
 * Hook để check permissions cho resource cụ thể
 * Sử dụng khi loader trả về resourcePermissions
 */
export function useResourcePermissions(loaderData) {
    return loaderData?.resourcePermissions || {
        canView: false,
        canUpdate: false,
        canDelete: false,
        isOwner: false,
    };
}
