import { redirect } from "react-router";
import { requireAuth } from "../../service/auth.server";
import { requireCreatePermission } from "../../service/authorization.server";
import { LessonModel } from "../../.server/lesson.repo";
import LessonEditor from "../../components/LessonEditor/LessonEditor";

export async function loader({ params, request }) {
  // Require authentication
  const user = await requireAuth(request);

  // Check permission: STUDENT không được tạo lesson
  try {
    requireCreatePermission(user);
  } catch (error) {
    // Redirect về dashboard nếu không có quyền
    throw redirect("/bang-dieu-khien");
  }

  const { classId = null, lessonId } = params;
  let lesson = null;

  if (lessonId) {
    const lessonModel = new LessonModel();
    lesson = await lessonModel.findById(lessonId);
  }

  return { classId, lesson, lessonId };
}

export default function CreateLessonPage({ loaderData }) {
  const { classId, lesson, lessonId } = loaderData;
  return (
    <LessonEditor
      classId={classId}
      lesson={lesson}
      lessonId={lessonId}
    />
  );
}