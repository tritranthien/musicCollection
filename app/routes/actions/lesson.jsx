import { redirect } from "react-router";
import { LessonModel } from "../../.server/lesson.repo";
import { requireAuth } from "../../service/auth.server";
import {
  requireCreatePermission,
  requireUpdatePermission,
  requireDeletePermission,
  getOwnerFilter,
} from "../../service/authorization.server";
import { commitSession, getSession } from "../../sessions.server";

export async function action({ request }) {
  const lessonModel = new LessonModel();

  try {
    // Require authentication
    const user = await requireAuth(request);

    const formData = await request.formData();
    const intent = formData.get("intent");
    const redirectUrl = formData.get("redirectUrl");

    switch (intent) {
      case "create": {
        // Check permission: STUDENT không được tạo
        requireCreatePermission(user);

        const title = formData.get("title");
        const description = formData.get("description");
        const classId = formData.get("classId");
        const filesJson = formData.get("files");
        const documentsJson = formData.get("documents");

        // Validate
        if (!title) {
          return Response.json(
            { error: "Thiếu thông tin bắt buộc" },
            { status: 400 }
          );
        }

        const files = filesJson ? JSON.parse(filesJson) : [];
        const documents = documentsJson ? JSON.parse(documentsJson) : [];

        // Validate limits
        if (files.length > 10) {
          return Response.json(
            { error: "Tối đa 10 file cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        if (documents.length > 10) {
          return Response.json(
            { error: "Tối đa 10 tài liệu cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        const newLesson = await lessonModel.createLesson({
          title,
          description,
          ownerId: user.id,
          ownerName: user.name,
          classId: classId ? Number(classId) : null,
          fileIds: files,
          documentIds: documents,
        });

        if (redirectUrl) {
          const session = await getSession(request.headers.get("Cookie"));
          session.flash("message", "Tạo bài giảng thành công!");
          return redirect(redirectUrl, {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }

        return Response.json(
          {
            success: true,
            message: "Tạo bài giảng thành công",
            lesson: newLesson
          },
          { status: 201 }
        );
      }

      case "update": {
        const id = formData.get("lessonId");
        const title = formData.get("title");
        const description = formData.get("description");
        const classId = formData.get("classId");
        const filesJson = formData.get("files");
        const documentsJson = formData.get("documents");

        if (!id) {
          return Response.json(
            { error: "Thiếu ID bài giảng" },
            { status: 400 }
          );
        }

        // Get existing lesson
        const existingLesson = await lessonModel.findById(id);
        if (!existingLesson) {
          return Response.json(
            { error: "Bài giảng không tồn tại" },
            { status: 404 }
          );
        }

        // Check permission: ADMIN/MANAGER update tất cả, TEACHER chỉ update của mình
        requireUpdatePermission(user, existingLesson);

        const files = filesJson ? JSON.parse(filesJson) : undefined;
        const documents = documentsJson ? JSON.parse(documentsJson) : undefined;

        // Validate limits
        if (files && files.length > 10) {
          return Response.json(
            { error: "Tối đa 10 file cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        if (documents && documents.length > 10) {
          return Response.json(
            { error: "Tối đa 10 tài liệu cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        const updatedLesson = await lessonModel.updateLesson(id, {
          title,
          description,
          classId: classId ? Number(classId) : null,
          fileIds: files,
          documentIds: documents,
        });

        if (redirectUrl) {
          const session = await getSession(request.headers.get("Cookie"));
          session.flash("message", "Cập nhật bài giảng thành công!");
          return redirect(redirectUrl, {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }

        return Response.json({
          success: true,
          message: "Cập nhật bài giảng thành công",
          lesson: updatedLesson,
        });
      }

      case "delete": {
        const id = formData.get("lessonId");

        if (!id) {
          return Response.json(
            { error: "Thiếu ID bài giảng" },
            { status: 400 }
          );
        }

        // Get existing lesson
        const existingLesson = await lessonModel.findById(id);
        if (!existingLesson) {
          return Response.json(
            { error: "Bài giảng không tồn tại" },
            { status: 404 }
          );
        }

        // Check permission: ADMIN/MANAGER delete tất cả, TEACHER chỉ delete của mình
        requireDeletePermission(user, existingLesson);

        await lessonModel.delete(id);

        if (redirectUrl) {
          const session = await getSession(request.headers.get("Cookie"));
          session.flash("message", "Xóa bài giảng thành công!");
          return redirect(redirectUrl, {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }

        return Response.json({
          success: true,
          message: "Xóa bài giảng thành công",
        });
      }

      default:
        return Response.json(
          { error: "Intent không hợp lệ" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Lesson action error:", error);

    // Handle authorization errors
    if (error instanceof Response) {
      throw error;
    }

    // Handle specific validation errors
    if (error.message.includes("not found")) {
      return Response.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes("Maximum") || error.message.includes("Tối đa")) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error: error.message || "Có lỗi xảy ra",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Loader để lấy danh sách lessons
export async function loader({ request }) {
  try {
    const user = await requireAuth(request);
    const lessonModel = new LessonModel();

    // Get owner filter dựa trên role
    const ownerFilter = getOwnerFilter(user);
    // ADMIN/MANAGER: {} (xem tất cả)
    // TEACHER: { ownerId: user.id } (chỉ xem của mình)
    // STUDENT: {} (xem tất cả, read-only)

    const lessons = ownerFilter.ownerId
      ? await lessonModel.findByOwnerId(ownerFilter.ownerId)
      : await lessonModel.findAll();

    return Response.json({
      lessons,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Lesson loader error:", error);

    // Handle auth errors
    if (error instanceof Response) {
      throw error;
    }

    return Response.json(
      {
        error: "Không thể tải danh sách bài giảng",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}