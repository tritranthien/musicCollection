import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/SideBar";
import styles from "../globals/styles/main.module.css";
import { Outlet } from "react-router";
import { getUser } from "../service/auth.server";
import { redirect } from "react-router";

export async function loader({ request }) {
    const user = await getUser(request);
    if (!user) throw redirect("/login"); // ❌ chưa login thì đuổi về login

  // Danh mục con trong mỗi lớp
  const classChildren = [
    { id: "lectures", name: "📚 Bài giảng", files: [], children: [] },
    { id: "videos", name: "🎬 Video", files: [], children: [] },
    { id: "images", name: "🖼️ Hình ảnh", files: [], children: [] },
    { id: "documents", name: "📄 Tài liệu", files: [], children: [] },
  ];

  // Tạo danh sách lớp 1 → 12
  const classes = Array.from({ length: 12 }, (_, i) => ({
    id: `class-${i + 1}`,
    name: `Lớp ${i + 1}`,
    children: classChildren.map((item) => ({
      ...item,
      id: `${i + 1}/${item.id}`,
    })),
  }));

  const treeData = [
    {
      id: "program",
      name: "📖 Chương trình học",
      children: classes,
    },
    {
        id: "suu-tam",
        name: "Sưu tầm",
        children: [
            { id: "suu-tam-am-nhac", name: "Âm nhạc" },
            { id: "suu-tam-hinh-anh", name: "Hình ảnh" },
            { id: "suu-tam-video", name: "Video" },
            { id: "suu-tam-tai-lieu", name: "Tài liệu" },
        ],
  },
  ];

  return { user, treeData };
}


export default function Dashboard({ loaderData }) {
  const { user, treeData } = loaderData;

  return (
    <div className={styles.dashboard}>
      <Header user={user} />

      <div className={styles.layout}>
        <Sidebar treeData={treeData} />

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
