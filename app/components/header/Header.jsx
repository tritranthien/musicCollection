import styles from "../../globals/styles/main.module.css";
import { Music2 } from "lucide-react";
import { Form } from "react-router";

export default function Header({ user }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Music2 size={24} color="#facc15" />
        <span className={styles.logoText}>Music Collection</span>
      </div>

      <div className={styles.userInfo}>
        <span className={styles.userName}>{user?.name}</span>
        <Form method="post" action="/logout">
          <button type="submit" className={styles.logoutBtn}>
            Đăng xuất
          </button>
        </Form>
      </div>
    </header>
  );
}
