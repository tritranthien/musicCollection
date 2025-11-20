import { FileModel } from "../../.server/fileUpload.repo";
import { requireAuth } from "../../service/auth.server";
import { requireCreatePermission } from "../../service/authorization.server";

export const action = async ({ request, params }) => {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Check permission: STUDENT không được upload
    requireCreatePermission(user);

    const formData = await request.formData();
    const file = formData.get("file");
    const classes = formData.get("classes") || "[]";
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const extraData = {
      name,
      description,
      classes: JSON.parse(classes),
    };
    if (category) extraData.category = category;
    const folder = params.path || "general";

    const fieldModel = new FileModel();
    const uploaded = await fieldModel.uploadFileToCloudinary(file, folder, user.id, extraData);

    return Response.json({ success: true, file: uploaded });
  } catch (err) {
    console.error("Upload failed:", err);

    // Handle authorization errors
    if (err instanceof Response) {
      throw err;
    }

    return Response.json({ error: err.message }, { status: 400 });
  }
};