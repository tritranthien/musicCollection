import { authService } from "~/services/auth.server.js";

// Remix route modules nhận được { request, context }
export async function withAuth(loaderOrAction) {
  return async (args) => {
    const user = await authService.authenticate(args.request);

    // inject user vào context để route dùng
    args.context = {
      ...args.context,
      user,
    };

    // gọi loader/action gốc
    return loaderOrAction(args);
  };
}
