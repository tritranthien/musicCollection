import FolderTree from "../folderTree/FolderTree";
import styles from "../../globals/styles/main.module.css";

export default function Sidebar({ treeData }) {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Thư mục</h3>
      <FolderTree data={treeData} />
    </aside>
  );
}
