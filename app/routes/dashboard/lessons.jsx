import React from "react";
import styles from "../../globals/styles/lessonList.module.css";

export async function loader({ params }) {
  const { id } = params;
  // Dữ liệu giả lập – sau này có thể load từ database hoặc API
  const lessons = [
    { id: 1, title: "Giới thiệu Toán học cơ bản", creator: "Thầy Nguyễn Văn A" },
    { id: 2, title: "Cộng trừ trong phạm vi 10", creator: "Cô Trần Thị B" },
    { id: 3, title: "Làm quen chữ cái A, B, C", creator: "Cô Lê Minh C" },
  ];

  return { classId: id, lessons };
}

export default function LessonList({ loaderData }) {
  const { classId, lessons } = loaderData;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>📚 Danh sách bài giảng – Lớp {classId}</h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên bài giảng</th>
              <th>Người tạo</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr
                key={lesson.id}
                className={styles.row}
                onClick={() => alert(`Mở bài giảng: ${lesson.title}`)}
              >
                <td>{lesson.title}</td>
                <td>{lesson.creator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
