import { redirect, useSearchParams } from "react-router";
import { Search, Filter, User, CheckCircle, ChevronDown, Check, X, Shield, ShieldOff } from "lucide-react";
import { requireRole } from "../service/auth.server.js";
import {
    getUsers,
    approveTeacher,
    rejectTeacher,
    promoteToManager,
    demoteToTeacher,
    getUserStats,
} from "../service/user.server.js";

export async function loader({ request }) {
    // Chỉ ADMIN và MANAGER mới được truy cập
    try {
        await requireRole(request, ["ADMIN", "MANAGER"]);
    } catch (error) {
        throw redirect("/bang-dieu-khien");
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");

    const [usersData, stats] = await Promise.all([
        getUsers({ role, status, search, page, limit: 20, excludeRoles: ["ADMIN"] }),
        getUserStats(),
    ]);

    return Response.json({ ...usersData, stats });
}

export async function action({ request }) {
    const user = await requireRole(request, ["ADMIN", "MANAGER"]);

    const formData = await request.formData();
    const actionType = formData.get("actionType");
    const userId = formData.get("userId");

    try {
        switch (actionType) {
            case "approve":
                await approveTeacher(userId);
                return Response.json({ success: true, message: "Đã phê duyệt tài khoản" });

            case "reject":
                await rejectTeacher(userId);
                return Response.json({ success: true, message: "Đã từ chối tài khoản" });

            case "promote":
                // Chỉ ADMIN mới được nâng cấp
                if (user.role !== "ADMIN") {
                    return Response.json({ error: "Chỉ ADMIN mới có quyền nâng cấp" }, { status: 403 });
                }
                await promoteToManager(userId);
                return Response.json({ success: true, message: "Đã nâng cấp lên MANAGER" });

            case "demote":
                // Chỉ ADMIN mới được hạ cấp
                if (user.role !== "ADMIN") {
                    return Response.json({ error: "Chỉ ADMIN mới có quyền hạ cấp" }, { status: 403 });
                }
                await demoteToTeacher(userId);
                return Response.json({ success: true, message: "Đã hạ cấp xuống TEACHER" });

            default:
                return Response.json({ error: "Hành động không hợp lệ" }, { status: 400 });
        }
    } catch (err) {
        return Response.json({ error: err.message }, { status: 400 });
    }
}

export function meta() {
    return [
        { title: "Quản lý người dùng - Admin Dashboard" },
        { name: "description", content: "Quản lý người dùng và phê duyệt tài khoản" },
    ];
}

export default function AdminUsers({ loaderData, actionData }) {
    const { users, total, page, totalPages, stats } = loaderData || {};
    const [searchParams] = useSearchParams();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Phê duyệt tài khoản giáo viên và quản lý quyền người dùng
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
                    <StatCard
                        title="Tổng người dùng"
                        value={stats?.totalUsers - 1 || 0}
                        icon="👥"
                        color="blue"
                    />
                    <StatCard
                        title="Giáo viên chờ duyệt"
                        value={stats?.pendingTeachers || 0}
                        icon="⏳"
                        color="yellow"
                    />
                    <StatCard
                        title="Học sinh hoạt động"
                        value={stats?.activeStudents || 0}
                        icon="🎓"
                        color="green"
                    />
                    <StatCard
                        title="Giáo viên"
                        value={stats?.totalTeachers || 0}
                        icon="👨‍🏫"
                        color="purple"
                    />
                    <StatCard
                        title="Quản lý"
                        value={stats?.totalManagers || 0}
                        icon="👔"
                        color="indigo"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                        <Filter size={20} />
                        <h2 className="font-semibold text-lg">Bộ lọc tìm kiếm</h2>
                    </div>

                    <form method="get" className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {/* Role Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} /> Vai trò
                            </label>
                            <div className="relative">
                                <select
                                    name="role"
                                    defaultValue={searchParams.get("role") || ""}
                                    className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="">Tất cả vai trò</option>
                                    <option value="STUDENT">Học sinh</option>
                                    <option value="TEACHER">Giáo viên</option>
                                    <option value="MANAGER">Quản lý</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CheckCircle size={16} /> Trạng thái
                            </label>
                            <div className="relative">
                                <select
                                    name="status"
                                    defaultValue={searchParams.get("status") || ""}
                                    className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="PENDING">Chờ duyệt</option>
                                    <option value="APPROVED">Đã duyệt</option>
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="REJECTED">Bị từ chối</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Search size={16} /> Tìm kiếm
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={searchParams.get("search") || ""}
                                    placeholder="Nhập tên hoặc email..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Search size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Filter size={18} />
                                Áp dụng
                            </button>
                        </div>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email xác thực
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users?.map((user) => (
                                <UserRow key={user.id} user={user} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <a
                                    key={p}
                                    href={`?page=${p}`}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${p === page
                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {p}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        indigo: "bg-indigo-50 text-indigo-600",
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
                        <span className="text-2xl">{icon}</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserRow({ user }) {
    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        ACTIVE: "bg-blue-100 text-blue-800",
        REJECTED: "bg-red-100 text-red-800",
    };

    const roleColors = {
        ADMIN: "bg-purple-100 text-purple-800",
        MANAGER: "bg-indigo-100 text-indigo-800",
        TEACHER: "bg-blue-100 text-blue-800",
        STUDENT: "bg-gray-100 text-gray-800",
    };

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]
                        }`}
                >
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[user.status]
                        }`}
                >
                    {user.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.emailVerified ? (
                    <span className="text-green-600">✓ Đã xác thực</span>
                ) : (
                    <span className="text-gray-400">✗ Chưa xác thực</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UserActions user={user} />
            </td>
        </tr>
    );
}

function UserActions({ user }) {
    return (
        <div className="flex justify-end gap-2">
            {user.role === "TEACHER" && user.status === "PENDING" && (
                <>
                    <form method="post" className="inline">
                        <input type="hidden" name="actionType" value="approve" />
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                            type="submit"
                            title="Phê duyệt"
                            className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                        >
                            <Check size={18} />
                        </button>
                    </form>
                    <form method="post" className="inline">
                        <input type="hidden" name="actionType" value="reject" />
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                            type="submit"
                            title="Từ chối"
                            className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </form>
                </>
            )}

            {user.role === "TEACHER" && (user.status === "APPROVED" || user.status === "ACTIVE") && (
                <form method="post" className="inline">
                    <input type="hidden" name="actionType" value="promote" />
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                        type="submit"
                        title="Nâng lên Quản lý"
                        className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                        <Shield size={18} />
                    </button>
                </form>
            )}

            {user.role === "MANAGER" && (
                <form method="post" className="inline">
                    <input type="hidden" name="actionType" value="demote" />
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                        type="submit"
                        title="Hạ xuống Giáo viên"
                        className="p-1.5 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                    >
                        <ShieldOff size={18} />
                    </button>
                </form>
            )}
        </div>
    );
}
