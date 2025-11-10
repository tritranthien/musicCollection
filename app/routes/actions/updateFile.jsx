import { FileModel } from "../../.server/fileUpload.repo";

export const action = async ({ request }) => {
  try {
    const data = await request.json();
    const fileId = data.id;
    if (!fileId) throw new Error("File ID is required");
    const fieldModel = new FileModel();
    const result = await fieldModel.updateFile(fileId, data);
    return { success: true, file: result };
  } catch (err) {
    console.error("Update failed:", err);
    return { error: err.message };
  }
};