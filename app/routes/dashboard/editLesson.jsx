import { redirect } from "react-router";
import { requireAuth } from "../../service/auth.server";
import { requireUpdatePermission } from "../../service/authorization.server";
import { LessonModel } from "../../.server/lesson.repo";
import LessonEditor from "../../components/LessonEditor/LessonEditor";

export async function loader({ params, request }) {
  // Require authentication
  const user = await requireAuth(request);

  const { lessonId } = params;

  if (!lessonId) {
    throw redirect("/bang-dieu-khien");
  }

  const lessonModel = new LessonModel();
  const lesson = await lessonModel.findById(lessonId);

  if (!lesson) {
    throw new Response("Không tìm thấy bài giảng", { status: 404 });
  }

  // Check permission: ADMIN/MANAGER edit tất cả, TEACHER chỉ edit của mình
  try {
    requireUpdatePermission(user, lesson);
  } catch (error) {
    // Redirect về dashboard nếu không có quyền
    throw redirect("/bang-dieu-khien");
  }

  return { lesson, lessonId };
}

export default function EditLessonPage({ loaderData }) {
  const { lesson, lessonId } = loaderData;
  return (
    <LessonEditor
      lesson={lesson}
      lessonId={lessonId}
    />
  );
}