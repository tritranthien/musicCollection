import { FileModel } from "../../.server/fileUpload.repo";
import { requireAuth } from "../../service/auth.server";
import { requireDeletePermission } from "../../service/authorization.server";

export const action = async ({ request }) => {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const data = await request.json();
    const fileId = data.id;
    if (!fileId) throw new Error("File ID is required");

    const fieldModel = new FileModel();

    // Get file để check ownership
    const existingFile = await fieldModel.findById(fileId);
    if (!existingFile) {
      throw new Error("File không tồn tại");
    }

    // Check permission: ADMIN/MANAGER delete tất cả, TEACHER chỉ delete của mình
    requireDeletePermission(user, existingFile);

    const result = await fieldModel.deleteFile(fileId);
    return Response.json({ success: true, file: result });
  } catch (err) {
    console.error("Delete failed:", err);

    // Handle authorization errors
    if (err instanceof Response) {
      throw err;
    }

    return Response.json({ error: err.message }, { status: 400 });
  }
};