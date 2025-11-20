# Fix ADMIN Can't Edit TEACHER's Categories

## Problem
ADMIN không thấy nút Edit/Delete cho categories do TEACHER tạo.

## Root Cause
Trong `FolderTree.jsx` dòng 111:
```javascript
{isOwner && item.edit && (
```

Logic này chỉ hiện nút khi `isOwner === true`. ADMIN không phải owner nên không thấy nút.

## Solution

Thay đổi logic thành:
```javascript
{item.edit && (permissions.isAdmin || permissions.isManager || (permissions.isTeacher && isOwner)) && (
```

### Step-by-step Fix:

1. **Import `usePermissions`** (dòng 8):
```javascript
import { usePermissions } from "../../hooks/usePermissions";
```

2. **Sử dụng hook** trong `TreeItem` component (sau dòng 15):
```javascript
const permissions = usePermissions();
```

3. **Thay đổi điều kiện** (dòng 111):
```javascript
// ❌ Code cũ
{isOwner && item.edit && (

// ✅ Code mới
{item.edit && (permissions.isAdmin || permissions.isManager || (permissions.isTeacher && isOwner)) && (
```

## Full Code Change

**File:** `app/components/folderTree/FolderTree.jsx`

**Line 8 - Add import:**
```javascript
import { usePermissions } from "../../hooks/usePermissions";
```

**Line 10-20 - Add hook:**
```javascript
const TreeItem = ({ item, level = 0, onCategoryAdd, currentPath = '', user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const permissions = usePermissions(); // ← ADD THIS LINE
  const hasChildren = item.children && item.children.length > 0;
  const canAddCategory = item.custom === true;
  
  const isOwner = item.ownerId === user?.id;
```

**Line 111-162 - Change condition:**
```javascript
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {/* ADMIN/MANAGER can edit all, TEACHER can only edit own */}
        {item.edit && (permissions.isAdmin || permissions.isManager || (permissions.isTeacher && isOwner)) && (
          <>
            <button
              onClick={handleEditClick}
              // ... rest of button code
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeleteClick}
              // ... rest of button code
            >
              <Trash2 size={14} />
            </button>
          </>
        )}

        {canAddCategory && permissions.canCreate && (
          <button
            onClick={handleAddClick}
            // ... rest of button code
          >
            <Plus size={14} />
          </button>
        )}
      </div>
```

## Testing

1. **Login as ADMIN**
2. **Navigate to** a category created by TEACHER
3. **Expected:** See Edit (✏️) and Delete (🗑️) buttons
4. **Click Edit** → Should open edit modal
5. **Server-side** will also check permissions (already protected)

## Permission Matrix

| Role | Own Category | Others' Category |
|------|--------------|------------------|
| **ADMIN** | ✅ Edit/Delete | ✅ Edit/Delete |
| **MANAGER** | ✅ Edit/Delete | ✅ Edit/Delete |
| **TEACHER** | ✅ Edit/Delete | ❌ No buttons |
| **STUDENT** | ❌ No buttons | ❌ No buttons |

---

**Manual Edit Required:** Please manually apply the changes above to `FolderTree.jsx` as the automated replacement failed due to file complexity.
