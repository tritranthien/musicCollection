import { Outlet, redirect } from "react-router";
import { TreeSidebar } from "../components/folderTree/FolderTree";
import Header from "../components/header/Header";
import styles from "../globals/styles/main.module.css";
import { getUser } from "../service/auth.server";
import { menuData } from "../utils/menuData";

export async function loader({ request }) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return { user };
}


export default function Dashboard({ loaderData }) {
  const { user } = loaderData;

  return (
    <div className={styles.dashboard}>
      <Header user={user} />

      <div className={styles.layout}>
        <TreeSidebar menuData={menuData} />

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
