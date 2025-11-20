# Bug Fix: TEACHER Permissions

## 🐛 Vấn đề

TEACHER không thấy các nút Upload, Edit, Delete mặc dù đã có `role: "TEACHER"` và `status: "APPROVED"`.

## 🔍 Nguyên nhân

Trong `app/service/authorization.server.js`, hàm `getUserPermissions()` **thiếu** `canUpdate` và `canDelete` trong object trả về:

```javascript
// ❌ Code cũ (SAI)
export const getUserPermissions = (user) => {
    return {
        canCreate: canCreate(user),
        canView: canView(user),
        canManageUsers: canManageUsers(user),
        canChangeRoles: canChangeRoles(user),
        isAdmin: isAdmin(user),
        isManager: isManager(user),
        isTeacher: isTeacher(user),
        isStudent: isStudent(user),
        // ❌ THIẾU canUpdate và canDelete!
    };
};
```

Trong khi UI components (FolderTree, FileLibraryLayout, etc.) đang check:
```javascript
{permissions.canUpdate && <button>Edit</button>}
{permissions.canDelete && <button>Delete</button>}
```

→ `permissions.canUpdate` và `permissions.canDelete` là `undefined` → buttons bị ẩn!

## ✅ Giải pháp

Thêm `canUpdate`, `canDelete`, và `userId` vào `getUserPermissions()`:

```javascript
// ✅ Code mới (ĐÚNG)
export const getUserPermissions = (user) => {
    return {
        canCreate: canCreate(user),
        canView: canView(user),
        canUpdate: !isStudent(user), // ✅ ADMIN, MANAGER, TEACHER có thể update
        canDelete: !isStudent(user), // ✅ ADMIN, MANAGER, TEACHER có thể delete
        canManageUsers: canManageUsers(user),
        canChangeRoles: canChangeRoles(user),
        isAdmin: isAdmin(user),
        isManager: isManager(user),
        isTeacher: isTeacher(user),
        isStudent: isStudent(user),
        userId: user.id, // ✅ Để UI check ownership
    };
};
```

## 📊 Permission Matrix (Updated)

| Role | canCreate | canView | canUpdate | canDelete | canManageUsers | canChangeRoles |
|------|-----------|---------|-----------|-----------|----------------|----------------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MANAGER** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **TEACHER** | ✅ | ✅ | ✅ (own only) | ✅ (own only) | ❌ | ❌ |
| **STUDENT** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🎯 Cách sử dụng trong UI

### 1. General Permissions (không cần resource)

```javascript
import { usePermissions } from "../hooks/usePermissions";

function MyComponent() {
  const permissions = usePermissions();
  
  return (
    <div>
      {/* Hiện nút Upload cho ADMIN, MANAGER, TEACHER */}
      {permissions.canCreate && <button>Upload</button>}
    </div>
  );
}
```

### 2. Resource-specific Permissions (cần check ownership)

```javascript
function FileCard({ file }) {
  const permissions = usePermissions();
  
  // TEACHER chỉ edit/delete file của mình
  const canEdit = permissions.canUpdate && 
                  (permissions.isAdmin || 
                   permissions.isManager || 
                   file.ownerId === permissions.userId);
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
    </div>
  );
}
```

### 3. Hoặc dùng PermissionGate

```javascript
import { PermissionGate, OwnerGate } from "../components/auth/PermissionGate";

function FileCard({ file }) {
  const permissions = usePermissions();
  
  return (
    <div>
      {/* Hiện cho tất cả có canCreate */}
      <PermissionGate permission="canCreate" permissions={permissions}>
        <button>Upload</button>
      </PermissionGate>
      
      {/* Chỉ hiện cho owner hoặc ADMIN/MANAGER */}
      <OwnerGate 
        resourcePermissions={{ isOwner: file.ownerId === permissions.userId }}
        permissions={permissions}
      >
        <button>Edit</button>
      </OwnerGate>
    </div>
  );
}
```

## 🧪 Testing

### Test với TEACHER account:

1. **Login as TEACHER** (`role: "TEACHER"`, `status: "APPROVED"`)
2. **Check permissions in console:**
   ```javascript
   // Trong browser DevTools
   const permissions = window.__remixContext.state.loaderData.root.permissions;
   console.log(permissions);
   // Expected:
   // {
   //   canCreate: true,
   //   canUpdate: true,
   //   canDelete: true,
   //   isTeacher: true,
   //   userId: "..."
   // }
   ```
3. **Verify UI:**
   - ✅ Thấy nút "Upload" trong file library
   - ✅ Thấy nút "Edit/Delete" cho files của mình
   - ❌ KHÔNG thấy "Edit/Delete" cho files của người khác

### Test với STUDENT account:

1. **Login as STUDENT**
2. **Check permissions:**
   ```javascript
   console.log(permissions);
   // Expected:
   // {
   //   canCreate: false,
   //   canUpdate: false,
   //   canDelete: false,
   //   isStudent: true
   // }
   ```
3. **Verify UI:**
   - ❌ KHÔNG thấy nút "Upload"
   - ❌ KHÔNG thấy nút "Edit/Delete"
   - ✅ Chỉ xem được (read-only)

## 📝 Files Changed

1. **`app/service/authorization.server.js`**
   - Thêm `canUpdate`, `canDelete`, `userId` vào `getUserPermissions()`
   - Cập nhật JSDoc

## 🚀 Next Steps

Nếu vẫn gặp vấn đề:

1. **Clear browser cache** và reload
2. **Logout và login lại** để refresh session
3. **Check console** xem có error không
4. **Verify user data** trong MongoDB:
   ```javascript
   db.users.findOne({ email: "trihhp1997@gmail.com" })
   ```

---

**Status:** ✅ Fixed

**Date:** 2025-11-20

**Impact:** TEACHER bây giờ có thể thấy và sử dụng các nút Upload/Edit/Delete đúng như thiết kế.
