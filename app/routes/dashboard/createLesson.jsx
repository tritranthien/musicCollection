import { LessonModel } from "../../.server/lesson.repo";
import LessonEditor from "../../components/LessonEditor/LessonEditor";

export async function loader({ params, request }) {
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