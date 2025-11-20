// app/service/user.server.js
import { prisma } from "../utils/db.server.js";
import {
    sendTeacherApprovedEmail,
    sendTeacherRejectedEmail
} from "./email.server.js";

/**
 * Lấy danh sách users với filter
 */
export const getUsers = async (filters = {}) => {
    const { role, status, search, page = 1, limit = 20 } = filters;

    const where = {};

    if (role) {
        where.role = role;
    } else if (filters.excludeRoles && filters.excludeRoles.length > 0) {
        where.role = { notIn: filters.excludeRoles };
    }

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Lấy thông tin user theo ID
 */
export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

/**
 * Phê duyệt tài khoản TEACHER
 */
export const approveTeacher = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    if (user.role !== "TEACHER") {
        throw new Error("Chỉ có thể phê duyệt tài khoản TEACHER");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status: "APPROVED" },
    });

    // Gửi email thông báo phê duyệt
    try {
        await sendTeacherApprovedEmail(user.email, user.name);
    } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Không throw error vì user đã được approve thành công
    }

    return updatedUser;
};

/**
 * Từ chối tài khoản TEACHER
 */
export const rejectTeacher = async (userId, reason = "") => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    if (user.role !== "TEACHER") {
        throw new Error("Chỉ có thể từ chối tài khoản TEACHER");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status: "REJECTED" },
    });

    // Gửi email thông báo từ chối
    try {
        await sendTeacherRejectedEmail(user.email, user.name, reason);
    } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
        // Không throw error vì user đã được reject thành công
    }

    return updatedUser;
};

/**
 * Chuyển TEACHER -> MANAGER (chỉ ADMIN mới được làm)
 */
export const promoteToManager = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    if (user.role !== "TEACHER") {
        throw new Error("Chỉ có thể nâng cấp TEACHER lên MANAGER");
    }

    return await prisma.user.update({
        where: { id: userId },
        data: {
            role: "MANAGER",
            status: "ACTIVE",
        },
    });
};

/**
 * Hạ cấp MANAGER -> TEACHER (chỉ ADMIN mới được làm)
 */
export const demoteToTeacher = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    if (user.role !== "MANAGER") {
        throw new Error("Chỉ có thể hạ cấp MANAGER xuống TEACHER");
    }

    return await prisma.user.update({
        where: { id: userId },
        data: {
            role: "TEACHER",
            status: "APPROVED",
        },
    });
};

/**
 * Lấy số lượng users theo trạng thái (cho dashboard stats)
 */
export const getUserStats = async () => {
    const [
        totalUsers,
        pendingTeachers,
        activeStudents,
        totalTeachers,
        totalManagers,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "TEACHER", status: "PENDING" } }),
        prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.user.count({ where: { role: "MANAGER" } }),
    ]);

    return {
        totalUsers,
        pendingTeachers,
        activeStudents,
        totalTeachers,
        totalManagers,
    };
};
