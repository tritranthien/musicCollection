import { Music2, Search } from "lucide-react";
import { useState } from "react";
import { Form, useNavigate } from "react-router";
import styles from "../../globals/styles/main.module.css";

export default function Header({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Music2 size={24} color="#facc15" />
          <span className={styles.logoText}>Music Collection</span>
        </div>

        <div className={styles.userInfo}>
          {/* 🔍 Icon search */}
          <button
            className={styles.searchButton}
            onClick={() => setOpen(true)}
            title="Tìm kiếm"
          >
            <Search size={20} color="#fff" />
          </button>

          <span
            className={styles.userName}
            onClick={() => navigate('/bang-dieu-khien/profile')}
            style={{ cursor: 'pointer' }}
            title="Xem thông tin tài khoản"
          >
            {user?.name}
          </span>
          <Form method="post" action="/logout">
            <button type="submit" className={styles.logoutBtn}>
              Đăng xuất
            </button>
          </Form>
        </div >
      </header >

      {/* Modal search selection */}
      {
        open && (
          <div className={styles.searchModalOverlay} onClick={() => setOpen(false)}>
            <div
              className={styles.searchModal}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '24px', height: 'auto', maxHeight: '80vh', width: '500px', overflow: 'auto' }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600', textAlign: 'center', color: '#1f2937' }}>
                Chọn loại tìm kiếm
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                <button
                  onClick={() => handleNavigate('/bang-dieu-khien/tim-kiem')}
                  className={styles.searchItem}
                  style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff', width: '100%' }}
                >
                  <div className={styles.searchItemIcon} style={{ width: '48px', height: '48px', fontSize: '24px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📁
                  </div>
                  <div className={styles.searchItemInfo} style={{ textAlign: 'left' }}>
                    <span className={styles.searchItemName} style={{ fontSize: '1rem', color: '#111827' }}>Tìm kiếm File</span>
                    <span className={styles.searchItemFilename} style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tìm kiếm trong kho lưu trữ file</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigate('/bang-dieu-khien/tim-kiem-tai-lieu')}
                  className={styles.searchItem}
                  style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff', width: '100%' }}
                >
                  <div className={styles.searchItemIcon} style={{ width: '48px', height: '48px', fontSize: '24px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📄
                  </div>
                  <div className={styles.searchItemInfo} style={{ textAlign: 'left' }}>
                    <span className={styles.searchItemName} style={{ fontSize: '1rem', color: '#111827' }}>Tìm kiếm Tài liệu</span>
                    <span className={styles.searchItemFilename} style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tìm kiếm văn bản, tài liệu học tập</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigate('/bang-dieu-khien/tim-kiem-bai-giang')}
                  className={styles.searchItem}
                  style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff', width: '100%' }}
                >
                  <div className={styles.searchItemIcon} style={{ width: '48px', height: '48px', fontSize: '24px', background: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🎓
                  </div>
                  <div className={styles.searchItemInfo} style={{ textAlign: 'left' }}>
                    <span className={styles.searchItemName} style={{ fontSize: '1rem', color: '#111827' }}>Tìm kiếm Bài giảng</span>
                    <span className={styles.searchItemFilename} style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tìm kiếm bài giảng, giáo án</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}
