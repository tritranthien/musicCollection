// app/service/authorization.server.js
// Authorization service - Kiểm tra quyền truy cập

/**
 * Permission levels:
 * - ADMIN: Full access to everything
 * - MANAGER: Full access to everything
 * - TEACHER: Can create/update/delete own resources only
 * - STUDENT: Read-only access
 */

// ==================== ROLE CHECKS ====================

export const isAdmin = (user) => {
    return user?.role === "ADMIN";
};

export const isManager = (user) => {
    return user?.role === "MANAGER";
};

export const isTeacher = (user) => {
    return user?.role === "TEACHER";
};

export const isStudent = (user) => {
    return user?.role === "STUDENT";
};

export const isAdminOrManager = (user) => {
    return isAdmin(user) || isManager(user);
};

// ==================== PERMISSION CHECKS ====================

/**
 * Kiểm tra user có quyền tạo resource không
 */
export const canCreate = (user) => {
    // STUDENT không có quyền tạo
    return user && !isStudent(user);
};

/**
 * Kiểm tra user có quyền xem resource không
 * @param {Object} user - User object
 * @param {Object} resource - Resource object (optional, có thể null nếu check general view permission)
 */
export const canView = (user, resource = null) => {
    // Tất cả user đã đăng nhập đều có quyền xem
    return !!user;
};

/**
 * Kiểm tra user có quyền update resource không
 * @param {Object} user - User object
 * @param {Object} resource - Resource object với ownerId
 */
export const canUpdate = (user, resource) => {
    if (!user || !resource) return false;

    // ADMIN và MANAGER có quyền update tất cả
    if (isAdminOrManager(user)) return true;

    // TEACHER chỉ có quyền update resource của mình
    if (isTeacher(user)) {
        return resource.ownerId === user.id;
    }

    // STUDENT không có quyền update
    return false;
};

/**
 * Kiểm tra user có quyền delete resource không
 * @param {Object} user - User object
 * @param {Object} resource - Resource object với ownerId
 */
export const canDelete = (user, resource) => {
    if (!user || !resource) return false;

    // ADMIN và MANAGER có quyền delete tất cả
    if (isAdminOrManager(user)) return true;

    // TEACHER chỉ có quyền delete resource của mình
    if (isTeacher(user)) {
        return resource.ownerId === user.id;
    }

    // STUDENT không có quyền delete
    return false;
};

/**
 * Kiểm tra user có quyền quản lý users không (approve/reject teachers, etc.)
 */
export const canManageUsers = (user) => {
    return isAdminOrManager(user);
};

/**
 * Kiểm tra user có quyền thay đổi role không
 */
export const canChangeRoles = (user) => {
    // Chỉ ADMIN mới có quyền thay đổi role
    return isAdmin(user);
};

// ==================== AUTHORIZATION GUARDS ====================

/**
 * Require user phải có quyền tạo
 * Throw error nếu không có quyền
 */
export const requireCreatePermission = (user) => {
    if (!canCreate(user)) {
        throw new Response("Forbidden - Bạn không có quyền tạo mới", { status: 403 });
    }
};

/**
 * Require user phải có quyền update resource
 * Throw error nếu không có quyền
 */
export const requireUpdatePermission = (user, resource) => {
    if (!canUpdate(user, resource)) {
        throw new Response("Forbidden - Bạn không có quyền chỉnh sửa", { status: 403 });
    }
};

/**
 * Require user phải có quyền delete resource
 * Throw error nếu không có quyền
 */
export const requireDeletePermission = (user, resource) => {
    if (!canDelete(user, resource)) {
        throw new Response("Forbidden - Bạn không có quyền xóa", { status: 403 });
    }
};

/**
 * Require user phải là ADMIN hoặc MANAGER
 * Throw error nếu không phải
 */
export const requireAdminOrManager = (user) => {
    if (!isAdminOrManager(user)) {
        throw new Response("Forbidden - Chỉ Admin/Manager mới có quyền truy cập", { status: 403 });
    }
};

/**
 * Require user phải là ADMIN
 * Throw error nếu không phải
 */
export const requireAdmin = (user) => {
    if (!isAdmin(user)) {
        throw new Response("Forbidden - Chỉ Admin mới có quyền truy cập", { status: 403 });
    }
};

// ==================== OWNERSHIP HELPERS ====================

/**
 * Kiểm tra user có phải owner của resource không
 */
export const isOwner = (user, resource) => {
    if (!user || !resource) return false;
    return resource.ownerId === user.id;
};

/**
 * Lấy owner filter cho query
 * - ADMIN/MANAGER: Không filter (xem tất cả)
 * - TEACHER: Filter theo ownerId
 * - STUDENT: Không áp dụng (vì chỉ xem)
 */
export const getOwnerFilter = (user) => {
    if (!user) return null;

    // ADMIN và MANAGER xem tất cả
    if (isAdminOrManager(user)) {
        return {};
    }

    // TEACHER chỉ xem của mình
    if (isTeacher(user)) {
        return { ownerId: user.id };
    }

    // STUDENT xem tất cả (read-only)
    return {};
};

/**
 * Set owner cho resource mới
 * Tự động set ownerId và ownerName
 */
export const setOwner = (user, data) => {
    return {
        ...data,
        ownerId: user.id,
        ownerName: user.name,
    };
};

// ==================== PERMISSION SUMMARY ====================

/**
 * Lấy tất cả permissions của user (general permissions)
 * Useful cho UI để ẩn/hiện buttons
 * 
 * Note: canUpdate và canDelete ở đây là general permissions.
 * Để check permission cho resource cụ thể, dùng getResourcePermissions(user, resource)
 * hoặc check ownership trong UI: permissions.isTeacher && resource.ownerId === permissions.userId
 */
export const getUserPermissions = (user) => {
    if (!user) {
        return {
            canCreate: false,
            canView: false,
            canUpdate: false,
            canDelete: false,
            canManageUsers: false,
            canChangeRoles: false,
            isAdmin: false,
            isManager: false,
            isTeacher: false,
            isStudent: false,
        };
    }

    return {
        canCreate: canCreate(user),
        canView: canView(user),
        canUpdate: !isStudent(user), // ADMIN, MANAGER, TEACHER có thể update (với ownership check)
        canDelete: !isStudent(user), // ADMIN, MANAGER, TEACHER có thể delete (với ownership check)
        canManageUsers: canManageUsers(user),
        canChangeRoles: canChangeRoles(user),
        isAdmin: isAdmin(user),
        isManager: isManager(user),
        isTeacher: isTeacher(user),
        isStudent: isStudent(user),
        userId: user.id, // Thêm userId để UI có thể check ownership
    };
};

/**
 * Lấy permissions cho một resource cụ thể
 */
export const getResourcePermissions = (user, resource) => {
    if (!user) {
        return {
            canView: false,
            canUpdate: false,
            canDelete: false,
            isOwner: false,
        };
    }

    return {
        canView: canView(user, resource),
        canUpdate: canUpdate(user, resource),
        canDelete: canDelete(user, resource),
        isOwner: isOwner(user, resource),
    };
};
