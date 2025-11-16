import { LessonModel } from "../../.server/lesson.repo";
import LessonEditor from "../../components/LessonEditor/LessonEditor";
import { getSession } from "../../utils/session.server";

export async function loader({ params, request }) {
  const { classId = null, lessonId } = params;
  const session = await getSession(request.headers.get("Cookie"));
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