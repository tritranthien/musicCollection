import { verifyEmail } from "../service/auth.server.js";

export async function loader({ request }) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
        return {
            error: "Token không hợp lệ",
        };
    }

    try {
        const user = await verifyEmail(token);
        return {
            success: true,
            userName: user.name,
            userEmail: user.email,
        };
    } catch (err) {
        return {
            error: err.message || "Xác thực email thất bại",
        };
    }
}

export default function VerifyEmail({ loaderData }) {
    // Hiển thị success
    if (loaderData?.success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 mx-4">
                    <div className="text-center">
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg
                                className="h-10 w-10 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ✅ Xác thực thành công!
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 mb-2">
                            Chào mừng <strong>{loaderData.userName}</strong>!
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Email <strong>{loaderData.userEmail}</strong> đã được xác thực.
                        </p>

                        {/* Success Box */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800">
                                🎉 Tài khoản của bạn đã được kích hoạt thành công!
                                <br />
                                Bạn có thể đăng nhập ngay bây giờ.
                            </p>
                        </div>

                        {/* Button */}
                        <a
                            href="/dang-nhap"
                            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                            </svg>
                            Đăng nhập ngay
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị error
    if (loaderData?.error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Xác thực thất bại
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">{loaderData.error}</p>
                        <div className="mt-6">
                            <a
                                href="/dang-nhap"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Quay lại đăng nhập
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
