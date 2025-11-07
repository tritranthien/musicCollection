import { FileModel } from "../../.server/fileUpload.repo";
import { getUser } from "../../service/auth.server";

export const action = async ({ request, params }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = params.path || "general";
    let user = await getUser(request);
    const fieldModel = new FileModel();
    const uploaded = await fieldModel.uploadFileToCloudinary(file, folder, user.id);
    return { success: true, file: uploaded };
  } catch (err) {
    console.error("Upload failed:", err);
    return { error: err.message };
  }
};