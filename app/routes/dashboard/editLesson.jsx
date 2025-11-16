import { LessonModel } from "../../.server/lesson.repo";
import LessonEditor from "../../components/LessonEditor/LessonEditor";

export async function loader({ params }) {
  const { lessonId } = params;

  let lesson = null;
  if (lessonId) {
    const lessonModel = new LessonModel();
    lesson = await lessonModel.findById(lessonId);
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