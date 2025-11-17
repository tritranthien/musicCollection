import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useFetcherWithReset } from "../../hooks/useFetcherWithReset";
import styles from "./FolderTree.module.css";
import { AddCategoryModal } from "./modal/AddCategoryModal";
import { DeleteModal } from "./modal/DeleteModal";
import { EditCategoryModal } from "./modal/EditCategoryModal";

const TreeItem = ({ item, level = 0, onCategoryAdd, currentPath = '', user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const canAddCategory = item.custom === true;
  
  const isOwner = item.ownerId === user?.id;
  const fetcher = useFetcherWithReset();
  const isActive = currentPath === item.path ||
    (hasChildren && item.children.some(child =>
      currentPath.startsWith(child.path)
    ));

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };
  const handleCategorySubmit = (name, rootPath) => {
    if (name.trim()) {
      const formData = new FormData();
      formData.append("intent", "create");
      formData.append("name", name.trim());
      formData.append("rootPath", rootPath.trim());

      fetcher.submit(formData, {
        method: "post",
        action: "/api/category",
      });
    }
  };
  const handleEditSubmit = (name) => {
    if (name.trim()) {
      const formData = new FormData();
      formData.append("intent", "update");
      formData.append("id", item.id);
      formData.append("name", name.trim());

      fetcher.submit(formData, {
        method: "post",
        action: "/api/category",
      });
    }
  };

  const handleDeleteConfirm = () => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", item.id);

    fetcher.submit(formData, {
      method: "post",
      action: "/api/category",
    });

    setIsDeleteModalOpen(false);
  };
  useEffect(() => {
    if (fetcher.data) {
      fetcher.reset();
    }
  }, [fetcher.data]);
  const ItemContent = () => (
    <div
      className={`${styles.itemContent} ${isActive && !hasChildren ? styles.active : ''}`}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
    >
      {hasChildren && (
        <span onClick={toggleOpen} className={styles.chevron}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
      {!hasChildren && <span className={styles.spacer} />}

      <span className={styles.icon}>
        {item.icon}
      </span>

      <span className={styles.label}>{item.label}</span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {isOwner && item.edit && (
          <>
            <button
              onClick={handleEditClick}
              style={{
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Chỉnh sửa"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeleteClick}
              style={{
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffebee';
                e.currentTarget.style.color = '#dc3545';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
              title="Xóa"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}

        {canAddCategory && (
          <button
            onClick={handleAddClick}
            style={{
              padding: '4px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#666'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Thêm category"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
  return (
    <>
      <div>
        {(hasChildren || item.nonLink) ? (
          <div onClick={toggleOpen} className={styles.clickable}>
            <ItemContent />
          </div>
        ) : (
          <Link to={item.path} prefetch="intent" className="link">
            <ItemContent />
          </Link>
        )}

        {hasChildren && isOpen && (
          <div className={styles.children}>
            {item.children.map((child, index) => (
              <TreeItem
                key={child.id || child.path || index}
                item={child}
                level={level + 1}
                onCategoryAdd={onCategoryAdd}
                currentPath={currentPath}
                user={user}
              />
            ))}
          </div>
        )}
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentLabel={item.label}
        onSubmit={(name)=>handleCategorySubmit(name,item.path)}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={item.label}
        onSubmit={handleEditSubmit}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xóa danh mục"
        message={<p>Bạn có chắc chắn muốn xóa danh mục <strong>{item.label}</strong>?</p>}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

// Main TreeSidebar Component
export const TreeSidebar = ({
  menuData,
  title = 'Navigation',
  currentPath = '/',
  onCategoryAdd,
  user = null
}) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <nav className={styles.nav}>
          {menuData.map((item, index) => (
            <TreeItem
              key={item.id || item.path || index}
              item={item}
              onCategoryAdd={onCategoryAdd}
              currentPath={currentPath}
              user={user}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};