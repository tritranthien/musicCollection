import { CategoryModel } from "../../.server/category.repo";
import { requireAuth } from "../../service/auth.server";
import {
  requireCreatePermission,
  requireUpdatePermission,
  requireDeletePermission,
} from "../../service/authorization.server";

export async function action({ request }) {
  const categoryModel = new CategoryModel();

  try {
    // Require authentication
    const user = await requireAuth(request);

    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
      case "create": {
        // Check permission: STUDENT không được tạo
        requireCreatePermission(user);

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
          ownerName: user.name,
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

        // Get existing category
        const existing = await categoryModel.findById(id);
        if (!existing) {
          return Response.json({ error: "Category không tồn tại" }, { status: 404 });
        }

        // Check permission: ADMIN/MANAGER update tất cả, TEACHER chỉ update của mình
        requireUpdatePermission(user, existing);

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

        // Get existing category
        const existing = await categoryModel.findById(id);
        if (!existing) {
          return Response.json({ error: "Category không tồn tại" }, { status: 404 });
        }

        // Check permission: ADMIN/MANAGER delete tất cả, TEACHER chỉ delete của mình
        requireDeletePermission(user, existing);

        await categoryModel.delete(id);

        return Response.json({ success: true, message: "Category đã được xóa" });
      }

      default:
        return Response.json({ error: "Invalid intent" }, { status: 400 });
    }
  } catch (error) {
    console.error("Category action error:", error);

    // Handle authorization errors
    if (error instanceof Response) {
      throw error;
    }

    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}