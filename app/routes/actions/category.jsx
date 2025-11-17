import { CategoryModel } from "../../.server/category.repo";
import { getUser } from "../../service/auth.server";

export async function action({ request }) {
  const user = await getUser(request);
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const categoryModel = new CategoryModel();

  try {
    switch (intent) {
      case "create": {
        const name = formData.get("name");
        const description = formData.get("description");
        const rootPath = formData.get("rootPath");

        if (!name || name.trim().length === 0) {
          return Response.json(
            { error: "Tên category không được để trống" },
            { status: 400 }
          );
        }

        const category = await categoryModel.createCategory({
          name: name.trim(),
          description: description?.trim() || null,
          ownerId: user.id,
          rootPath: rootPath?.trim() || null,
        });

        return Response.json({ success: true, category }, { status: 201 });
      }

      case "update": {
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const rootPath = formData.get("rootPath");

        if (!id) {
          return Response.json({ error: "Category ID is required" }, { status: 400 });
        }

        // Kiểm tra quyền sở hữu
        const existing = await categoryModel.findById(id);
        if (!existing || existing.ownerId !== user.id) {
          return Response.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
        }

        const category = await categoryModel.updateCategory(id, {
          name: name?.trim(),
          description: description?.trim(),
          rootPath: rootPath?.trim() || null,
        });

        return Response.json({ success: true, category });
      }

      case "delete": {
        const id = formData.get("id");

        if (!id) {
          return Response.json({ error: "Category ID is required" }, { status: 400 });
        }

        // Kiểm tra quyền sở hữu
        const existing = await categoryModel.findById(id);
        if (!existing || existing.ownerId !== user.id) {
          return Response.json({ error: "Không có quyền xóa" }, { status: 403 });
        }

        await categoryModel.delete(id);

        return Response.json({ success: true, message: "Category đã được xóa" });
      }

      default:
        return Response.json({ error: "Invalid intent" }, { status: 400 });
    }
  } catch (error) {
    console.error("Category action error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}