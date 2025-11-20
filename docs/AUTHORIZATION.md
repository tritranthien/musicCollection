# Authorization System - Hướng dẫn sử dụng

## Tổng quan

Hệ thống phân quyền (authorization) kiểm soát **ai có thể làm gì** trong ứng dụng.

### Phân quyền theo Role:

| Role | Quyền |
|------|-------|
| **ADMIN** | ✅ Full access - Tất cả CRUD operations trên mọi resource |
| **MANAGER** | ✅ Full access - Tất cả CRUD operations trên mọi resource |
| **TEACHER** | ✅ Create/Update/Delete **chỉ resources của mình** |
| **STUDENT** | ✅ Read-only - Chỉ xem, không có quyền write |

## 🔐 API Reference

### Role Checks

```javascript
import { 
  isAdmin, 
  isManager, 
  isTeacher, 
  isStudent,
  isAdminOrManager 
} from "../service/authorization.server.js";

// Check role
if (isAdmin(user)) {
  // User là ADMIN
}

if (isAdminOrManager(user)) {
  // User là ADMIN hoặc MANAGER
}
```

### Permission Checks

```javascript
import { 
  canCreate,
  canView,
  canUpdate,
  canDelete
} from "../service/authorization.server.js";

// Check có quyền tạo không
if (canCreate(user)) {
  // User có thể tạo resource mới
  // ADMIN, MANAGER, TEACHER: true
  // STUDENT: false
}

// Check có quyền update resource không
if (canUpdate(user, resource)) {
  // ADMIN, MANAGER: true (update tất cả)
  // TEACHER: true nếu resource.ownerId === user.id
  // STUDENT: false
}

// Check có quyền delete resource không
if (canDelete(user, resource)) {
  // Logic tương tự canUpdate
}
```

### Authorization Guards (Throw errors)

```javascript
import { 
  requireCreatePermission,
  requireUpdatePermission,
  requireDeletePermission,
  requireAdminOrManager,
  requireAdmin
} from "../service/authorization.server.js";

// Trong route action:
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  
  // Throw 403 nếu không có quyền create
  requireCreatePermission(user);
  
  // Throw 403 nếu không phải ADMIN/MANAGER
  requireAdminOrManager(user);
  
  // Throw 403 nếu không phải ADMIN
  requireAdmin(user);
  
  // ... tiếp tục logic
};
```

### Ownership Helpers

```javascript
import { 
  isOwner,
  getOwnerFilter,
  setOwner
} from "../service/authorization.server.js";

// Check ownership
if (isOwner(user, resource)) {
  // User là owner của resource
}

// Get filter cho query (dùng trong loader)
const filter = getOwnerFilter(user);
// ADMIN/MANAGER: {} (xem tất cả)
// TEACHER: { ownerId: user.id } (chỉ xem của mình)
// STUDENT: {} (xem tất cả, read-only)

const files = await prisma.file.findMany({
  where: {
    ...filter,
    // ... other filters
  }
});

// Set owner khi tạo resource mới
const newFile = await prisma.file.create({
  data: setOwner(user, {
    filename: "test.pdf",
    url: "...",
    // ... other fields
  })
  // Tự động thêm: ownerId, ownerName
});
```

## 📝 Ví dụ thực tế

### 1. Upload File (Create)

```javascript
// app/routes/actions/upload.jsx
import { requireAuth } from "../../service/auth.server";
import { requireCreatePermission } from "../../service/authorization.server";

export const action = async ({ request }) => {
  // 1. Require authentication
  const user = await requireAuth(request);
  
  // 2. Check permission (STUDENT không được upload)
  requireCreatePermission(user);
  
  // 3. Process upload
  const formData = await request.formData();
  const file = formData.get("file");
  
  // Upload file với user.id làm owner
  const uploaded = await uploadFile(file, user.id);
  
  return Response.json({ success: true, file: uploaded });
};
```

### 2. Update File

```javascript
// app/routes/actions/updateFile.jsx
import { requireAuth } from "../../service/auth.server";
import { requireUpdatePermission } from "../../service/authorization.server";

export const action = async ({ request }) => {
  const user = await requireAuth(request);
  
  const { id, ...data } = await request.json();
  
  // Get existing file
  const existingFile = await prisma.file.findUnique({ where: { id } });
  
  // Check permission
  // ADMIN/MANAGER: OK
  // TEACHER: OK nếu existingFile.ownerId === user.id
  // STUDENT: 403 Forbidden
  requireUpdatePermission(user, existingFile);
  
  // Update
  const updated = await prisma.file.update({
    where: { id },
    data
  });
  
  return Response.json({ success: true, file: updated });
};
```

### 3. Delete File

```javascript
// app/routes/actions/deleteFile.jsx
import { requireAuth } from "../../service/auth.server";
import { requireDeletePermission } from "../../service/authorization.server";

export const action = async ({ request }) => {
  const user = await requireAuth(request);
  
  const { id } = await request.json();
  
  // Get existing file
  const existingFile = await prisma.file.findUnique({ where: { id } });
  
  // Check permission (logic tương tự update)
  requireDeletePermission(user, existingFile);
  
  // Delete
  await prisma.file.delete({ where: { id } });
  
  return Response.json({ success: true });
};
```

### 4. List Files (với filter theo owner)

```javascript
// app/routes/files.jsx
import { requireAuth } from "../service/auth.server";
import { getOwnerFilter } from "../service/authorization.server";

export const loader = async ({ request }) => {
  const user = await requireAuth(request);
  
  // Get owner filter
  const ownerFilter = getOwnerFilter(user);
  // ADMIN/MANAGER: {} (xem tất cả)
  // TEACHER: { ownerId: user.id } (chỉ xem của mình)
  // STUDENT: {} (xem tất cả)
  
  const files = await prisma.file.findMany({
    where: {
      ...ownerFilter,
      // ... other filters
    }
  });
  
  return Response.json({ files });
};
```

### 5. Admin-only route

```javascript
// app/routes/admin.settings.jsx
import { requireAuth } from "../service/auth.server";
import { requireAdmin } from "../service/authorization.server";

export const loader = async ({ request }) => {
  const user = await requireAuth(request);
  
  // Chỉ ADMIN mới truy cập được
  requireAdmin(user);
  
  // ... load settings
};
```

## 🎨 UI - Ẩn/hiện buttons dựa trên quyền

### Client-side permission check

```javascript
import { getUserPermissions, getResourcePermissions } from "../service/authorization.server";

export const loader = async ({ request }) => {
  const user = await requireAuth(request);
  
  // Get permissions để gửi cho client
  const permissions = getUserPermissions(user);
  
  return Response.json({ user, permissions });
};

// Trong component:
function FileList({ loaderData }) {
  const { permissions } = loaderData;
  
  return (
    <div>
      {permissions.canCreate && (
        <button>Upload File</button>
      )}
      
      {/* ... */}
    </div>
  );
}
```

### Resource-specific permissions

```javascript
export const loader = async ({ request, params }) => {
  const user = await requireAuth(request);
  const file = await prisma.file.findUnique({ where: { id: params.id } });
  
  // Get permissions cho file cụ thể
  const permissions = getResourcePermissions(user, file);
  
  return Response.json({ file, permissions });
};

// Trong component:
function FileDetail({ loaderData }) {
  const { file, permissions } = loaderData;
  
  return (
    <div>
      <h1>{file.name}</h1>
      
      {permissions.canUpdate && (
        <button>Edit</button>
      )}
      
      {permissions.canDelete && (
        <button>Delete</button>
      )}
    </div>
  );
}
```

## 🔒 Best Practices

### 1. Always check permissions server-side

```javascript
// ❌ BAD - Chỉ check client-side
function UploadButton({ user }) {
  if (user.role === 'STUDENT') return null;
  return <button onClick={upload}>Upload</button>;
}

// ✅ GOOD - Check cả client và server
// Client: Ẩn button
function UploadButton({ permissions }) {
  if (!permissions.canCreate) return null;
  return <button onClick={upload}>Upload</button>;
}

// Server: Enforce permission
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  requireCreatePermission(user); // ← Bắt buộc
  // ...
};
```

### 2. Handle authorization errors properly

```javascript
export const action = async ({ request }) => {
  try {
    const user = await requireAuth(request);
    requireCreatePermission(user);
    // ...
  } catch (err) {
    // Authorization errors là Response objects
    if (err instanceof Response) {
      throw err; // Re-throw để React Router handle
    }
    
    // Other errors
    return Response.json({ error: err.message }, { status: 400 });
  }
};
```

### 3. Use guards for cleaner code

```javascript
// ❌ BAD - Manual checks
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    throw new Response("Forbidden", { status: 403 });
  }
  // ...
};

// ✅ GOOD - Use guards
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  requireAdminOrManager(user);
  // ...
};
```

### 4. Always check ownership for update/delete

```javascript
// ❌ BAD - Không check ownership
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  const { id } = await request.json();
  
  await prisma.file.delete({ where: { id } });
  // TEACHER có thể delete file của người khác!
};

// ✅ GOOD - Check ownership
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  const { id } = await request.json();
  
  const file = await prisma.file.findUnique({ where: { id } });
  requireDeletePermission(user, file); // ← Check ownership
  
  await prisma.file.delete({ where: { id } });
};
```

## 📊 Permission Matrix

| Action | ADMIN | MANAGER | TEACHER | STUDENT |
|--------|-------|---------|---------|---------|
| View all resources | ✅ | ✅ | ❌ (own only) | ✅ |
| Create resource | ✅ | ✅ | ✅ | ❌ |
| Update own resource | ✅ | ✅ | ✅ | ❌ |
| Update others' resource | ✅ | ✅ | ❌ | ❌ |
| Delete own resource | ✅ | ✅ | ✅ | ❌ |
| Delete others' resource | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ | ❌ |

## 🧪 Testing

```javascript
// Test permissions
import { canUpdate, canDelete } from "../service/authorization.server";

// Mock users
const admin = { id: '1', role: 'ADMIN' };
const teacher = { id: '2', role: 'TEACHER' };
const student = { id: '3', role: 'STUDENT' };

// Mock resource
const file = { id: 'f1', ownerId: '2' }; // Owned by teacher

// Tests
console.assert(canUpdate(admin, file) === true, 'Admin can update all');
console.assert(canUpdate(teacher, file) === true, 'Teacher can update own');
console.assert(canUpdate(student, file) === false, 'Student cannot update');

const otherFile = { id: 'f2', ownerId: '999' };
console.assert(canUpdate(teacher, otherFile) === false, 'Teacher cannot update others');
```

---

**Tóm lại:**
- ✅ Luôn check permissions server-side
- ✅ Sử dụng guards để code sạch hơn
- ✅ Check ownership cho update/delete
- ✅ Ẩn UI elements dựa trên permissions
- ✅ Handle errors properly
