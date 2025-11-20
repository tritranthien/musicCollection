import { Outlet, redirect } from "react-router";
import { TreeSidebar } from "../components/folderTree/FolderTree";
import Header from "../components/header/Header";
import styles from "../globals/styles/main.module.css";
import { getUser } from "../service/auth.server";
import { canManageUsers, getUserPermissions } from "../service/authorization.server";
import { menuData } from "../utils/menuData";
import { CategoryModel } from "../.server/category.repo";
import { CategoryProvider } from "../context/CategoryContext";
import toast, { Toaster } from 'react-hot-toast';
import { commitSession, getSession } from "../sessions.server";
import { useEffect } from "react";

export async function loader({ request }) {
  const user = await getUser(request);
  if (!user) throw redirect("/dang-nhap");

  const isManager = await canManageUsers(user);
  let existMenuData = menuData;
  if (!isManager) {
    existMenuData = menuData.filter((item) => item.path !== '/bang-dieu-khien/admin');
  }
  // Get user permissions
  const permissions = getUserPermissions(user);

  const categoryModel = new CategoryModel();
  const customCategories = await categoryModel.findAll();
  const session = await getSession(request.headers.get("Cookie"));
  let message = session.get("message");

  const menuList = [
    ...existMenuData,
    {
      label: 'Sưu tập',
      path: '/suu-tap',
      icon: '🗂️',
      custom: true,
      edit: false,
      children: [
        { icon: '🎬', label: 'Video', path: `/bang-dieu-khien/suu-tap/video`, edit: false },
        { icon: '🖼️', label: 'Hình ảnh', path: `/bang-dieu-khien/suu-tap/hinh-anh`, edit: false },
        { icon: '🎧', label: 'Âm thanh', path: `/bang-dieu-khien/suu-tap/am-thanh`, edit: false },
        { icon: '📄', label: 'Tài liệu', path: `/bang-dieu-khien/suu-tap/tai-lieu`, edit: false },
        ...customCategories.filter((category) => category.rootPath === '/suu-tap').map((category) => ({
          id: category.id,
          slug: category.slug,
          ownerId: category.ownerId,
          icon: '🗃️',
          label: category.name,
          path: `/bang-dieu-khien/tuy-chinh/${category.slug}`,
          edit: true,
        }))
      ]
    },
    {
      label: 'Thông tin sưu tầm',
      path: '/thong-tin-suu-tam',
      icon: '📄',
      custom: true,
      edit: false,
      nonLink: true,
      children: [
        ...customCategories.filter((category) => category.rootPath === '/thong-tin-suu-tam').map((category) => ({
          id: category.id,
          slug: category.slug,
          ownerId: category.ownerId,
          icon: '🗃️',
          label: category.name,
          path: `/bang-dieu-khien/thong-tin-suu-tam/${category.slug}`,
          edit: true,
        }))
      ]
    }
  ];

  return Response.json({
    user,
    permissions, // ← Thêm permissions
    message,
    menuList,
    customCategories
  }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  });
}


export default function Dashboard({ loaderData }) {
  const { user, menuList, customCategories, message = '' } = loaderData;
  useEffect(() => {
    if (message && message !== '') {
      toast(message);
    }
  }, [message]);
  return (
    <CategoryProvider customCategories={customCategories}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className={styles.dashboard}>
        <Header user={user} />

        <div className={styles.layout}>
          <TreeSidebar menuData={menuList} user={user} />

          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </CategoryProvider>
  );
}
