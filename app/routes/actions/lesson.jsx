// app/routes/lessons.action.js (hoặc routes/api.lessons.js)

import { redirect } from "react-router";
import { LessonModel } from "../../.server/lesson.repo";
import { getUser } from "../../service/auth.server";
import { commitSession, getSession } from "../../sessions.server";

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const user = await getUser(request);
  const lessonModel = new LessonModel();
  const redirectUrl = formData.get("redirectUrl");
  try {
    switch (intent) {
      case "create": {
        const title = formData.get("title");
        const description = formData.get("description");
        const classId = formData.get("classId");
        const filesJson = formData.get("files");
        
        // Validate
        if (!title || !user.id) {
          return Response.json(
            { error: "Thiếu thông tin bắt buộc" },
            { status: 400 }
          );
        }

        const files = filesJson ? JSON.parse(filesJson) : [];

        const newLesson = await lessonModel.createLesson({
          title,
          description,
          ownerId: user.id,
          classId: classId ? Number(classId) : null,
          fileIds: files,
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

        if (!id) {
          return Response.json(
            { error: "Thiếu ID bài giảng" },
            { status: 400 }
          );
        }

        const files = filesJson ? JSON.parse(filesJson) : undefined;

        const updatedLesson = await lessonModel.updateLesson(id, {
          title,
          description,
          ownerId: user.id,
          classId: classId ? Number(classId) : null,
          fileIds: files,
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

        await lessonModel.delete(id);

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
    return Response.json(
      { 
        error: error.message || "Có lỗi xảy ra",
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}

// Loader để lấy danh sách lessons (optional)
export async function loader({ request }) {
  const userId = getUser(request).id;

  try {
    const lessonModel = new LessonModel();
    if (userId) {
      const lessons = await lessonModel.findByOwnerId(Number(userId));
      return Response.json({ lessons });
    }

    const lessons = await lessonModel.findAll();
    return Response.json({ lessons });
  } catch (error) {
    console.error("Lesson loader error:", error);
    return Response.json(
      { error: "Không thể tải danh sách bài giảng" },
      { status: 500 }
    );
  }
}