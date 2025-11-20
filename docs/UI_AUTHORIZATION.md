# UI Authorization - Hướng dẫn ẩn/hiện elements

## Tổng quan

Sau khi đã protect routes ở server-side, chúng ta cần ẩn/hiện UI elements để UX tốt hơn.

## 🎯 Nguyên tắc

**Luôn luôn check permissions ở cả 2 nơi:**
1. ✅ **Server-side** (bắt buộc) - Security
2. ✅ **Client-side** (UX) - Ẩn buttons user không có quyền dùng

## 📦 Tools có sẵn

### 1. Hooks

```javascript
import { usePermissions, useUser, useRole } from "../hooks/usePermissions";

function MyComponent() {
  // Get permissions
  const permissions = usePermissions();
  // { canCreate, canView, canManageUsers, isAdmin, isManager, isTeacher, isStudent }
  
  // Get user
  const user = useUser();
  // { id, name, email, role, ... }
  
  // Get role info
  const { isAdmin, isTeacher, role } = useRole();
}
```

### 2. Permission Gates (Components)

```javascript
import { 
  PermissionGate, 
  RoleGate, 
  StudentGate,
  OwnerGate,
  ResourcePermissionGate
} from "../components/auth/PermissionGate";
```

## 💡 Examples

### Example 1: Ẩn Upload button cho STUDENT

```javascript
import { usePermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../components/auth/PermissionGate";

function FileList() {
  const permissions = usePermissions();
  
  return (
    <div>
      <h1>Files</h1>
      
      {/* Option 1: Conditional rendering */}
      {permissions.canCreate && (
        <button onClick={handleUpload}>Upload File</button>
      )}
      
      {/* Option 2: Permission Gate */}
      <PermissionGate permission="canCreate" permissions={permissions}>
        <button onClick={handleUpload}>Upload File</button>
      </PermissionGate>
    </div>
  );
}
```

### Example 2: Ẩn Edit/Delete cho non-owners

```javascript
import { usePermissions } from "../hooks/usePermissions";

export async function loader({ request, params }) {
  const user = await requireAuth(request);
  const file = await prisma.file.findUnique({ where: { id: params.id } });
  
  // Get resource permissions
  const resourcePermissions = getResourcePermissions(user, file);
  const permissions = getUserPermissions(user);
  
  return Response.json({ file, resourcePermissions, permissions });
}

function FileDetail({ loaderData }) {
  const { file, resourcePermissions, permissions } = loaderData;
  
  return (
    <div>
      <h1>{file.name}</h1>
      
      {/* Chỉ hiện nếu có quyền update */}
      {resourcePermissions.canUpdate && (
        <button>Edit</button>
      )}
      
      {/* Chỉ hiện nếu có quyền delete */}
      {resourcePermissions.canDelete && (
        <button>Delete</button>
      )}
      
      {/* Hoặc dùng ResourcePermissionGate */}
      <ResourcePermissionGate 
        permission="canUpdate" 
        resourcePermissions={resourcePermissions}
      >
        <button>Edit</button>
      </ResourcePermissionGate>
    </div>
  );
}
```

### Example 3: Admin-only section

```javascript
import { RoleGate } from "../components/auth/PermissionGate";
import { usePermissions } from "../hooks/usePermissions";

function Settings() {
  const permissions = usePermissions();
  
  return (
    <div>
      <h1>Settings</h1>
      
      {/* Chỉ ADMIN và MANAGER thấy */}
      <RoleGate roles={['ADMIN', 'MANAGER']} permissions={permissions}>
        <section>
          <h2>User Management</h2>
          <button>Manage Users</button>
        </section>
      </RoleGate>
      
      {/* Chỉ ADMIN thấy */}
      <RoleGate roles={['ADMIN']} permissions={permissions}>
        <section>
          <h2>System Settings</h2>
          <button>Configure</button>
        </section>
      </RoleGate>
    </div>
  );
}
```

### Example 4: Ẩn toàn bộ section cho STUDENT

```javascript
import { StudentGate } from "../components/auth/PermissionGate";
import { usePermissions } from "../hooks/usePermissions";

function Toolbar() {
  const permissions = usePermissions();
  
  return (
    <div className="toolbar">
      {/* STUDENT không thấy phần này */}
      <StudentGate permissions={permissions}>
        <div className="actions">
          <button>Create</button>
          <button>Upload</button>
          <button>Import</button>
        </div>
      </StudentGate>
      
      {/* Tất cả đều thấy */}
      <div className="view-options">
        <button>Grid View</button>
        <button>List View</button>
      </div>
    </div>
  );
}
```

### Example 5: Owner-only actions

```javascript
import { OwnerGate } from "../components/auth/PermissionGate";

function FileCard({ file, resourcePermissions, permissions }) {
  return (
    <div className="file-card">
      <h3>{file.name}</h3>
      <p>Owner: {file.ownerName}</p>
      
      {/* Chỉ owner hoặc ADMIN/MANAGER thấy */}
      <OwnerGate 
        resourcePermissions={resourcePermissions} 
        permissions={permissions}
      >
        <div className="owner-actions">
          <button>Edit</button>
          <button>Delete</button>
          <button>Share</button>
        </div>
      </OwnerGate>
    </div>
  );
}
```

### Example 6: Conditional button text

```javascript
import { useRole } from "../hooks/usePermissions";

function CreateButton() {
  const { isStudent } = useRole();
  
  if (isStudent) {
    return null; // Không hiện button
  }
  
  return <button>Create New</button>;
}
```

### Example 7: Disable thay vì ẩn

```javascript
import { usePermissions } from "../hooks/usePermissions";

function ActionButtons() {
  const permissions = usePermissions();
  
  return (
    <div>
      {/* Disable button thay vì ẩn */}
      <button 
        disabled={!permissions.canCreate}
        title={!permissions.canCreate ? "Bạn không có quyền tạo" : ""}
      >
        Create
      </button>
      
      {/* Hoặc thay đổi style */}
      <button 
        className={permissions.canCreate ? "btn-primary" : "btn-disabled"}
        onClick={permissions.canCreate ? handleCreate : undefined}
      >
        Create
      </button>
    </div>
  );
}
```

## 🎨 UI Patterns

### Pattern 1: Dropdown menu với permissions

```javascript
function FileMenu({ file, resourcePermissions }) {
  return (
    <DropdownMenu>
      {/* Tất cả đều thấy */}
      <MenuItem onClick={handleView}>View</MenuItem>
      <MenuItem onClick={handleDownload}>Download</MenuItem>
      
      {/* Chỉ có quyền update mới thấy */}
      {resourcePermissions.canUpdate && (
        <>
          <MenuDivider />
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleRename}>Rename</MenuItem>
        </>
      )}
      
      {/* Chỉ có quyền delete mới thấy */}
      {resourcePermissions.canDelete && (
        <>
          <MenuDivider />
          <MenuItem onClick={handleDelete} danger>Delete</MenuItem>
        </>
      )}
    </DropdownMenu>
  );
}
```

### Pattern 2: Sidebar menu với role-based items

```javascript
import { usePermissions } from "../hooks/usePermissions";

function Sidebar() {
  const permissions = usePermissions();
  
  const menuItems = [
    { label: "Dashboard", path: "/", show: true },
    { label: "Files", path: "/files", show: true },
    { label: "Upload", path: "/upload", show: permissions.canCreate },
    { label: "Users", path: "/users", show: permissions.canManageUsers },
    { label: "Settings", path: "/settings", show: permissions.isAdmin },
  ];
  
  return (
    <nav>
      {menuItems
        .filter(item => item.show)
        .map(item => (
          <NavLink key={item.path} to={item.path}>
            {item.label}
          </NavLink>
        ))
      }
    </nav>
  );
}
```

### Pattern 3: Table với action columns

```javascript
function FileTable({ files, permissions }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Owner</th>
          <th>Date</th>
          {/* Chỉ hiện Actions column nếu không phải STUDENT */}
          {!permissions.isStudent && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {files.map(file => (
          <tr key={file.id}>
            <td>{file.name}</td>
            <td>{file.ownerName}</td>
            <td>{file.createdAt}</td>
            {!permissions.isStudent && (
              <td>
                <FileActions file={file} permissions={permissions} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FileActions({ file, permissions }) {
  const canUpdate = permissions.isAdmin || 
                    permissions.isManager || 
                    (permissions.isTeacher && file.ownerId === permissions.userId);
  
  return (
    <div className="actions">
      {canUpdate && <button>Edit</button>}
      {canUpdate && <button>Delete</button>}
    </div>
  );
}
```

## 🔒 Best Practices

### 1. Luôn check server-side

```javascript
// ❌ BAD - Chỉ ẩn UI
function DeleteButton({ file }) {
  const permissions = usePermissions();
  
  if (!permissions.canDelete) return null;
  
  return <button onClick={() => deleteFile(file.id)}>Delete</button>;
}

// ✅ GOOD - Ẩn UI + protect server
function DeleteButton({ file }) {
  const permissions = usePermissions();
  
  if (!permissions.canDelete) return null;
  
  return <button onClick={() => deleteFile(file.id)}>Delete</button>;
}

// Server action
export const action = async ({ request }) => {
  const user = await requireAuth(request);
  const { id } = await request.json();
  
  const file = await prisma.file.findUnique({ where: { id } });
  requireDeletePermission(user, file); // ← Bắt buộc
  
  await prisma.file.delete({ where: { id } });
};
```

### 2. Sử dụng gates cho code sạch hơn

```javascript
// ❌ OK - Nhưng nhiều code
function Toolbar() {
  const permissions = usePermissions();
  
  return (
    <div>
      {permissions.canCreate && <button>Create</button>}
      {permissions.canCreate && <button>Upload</button>}
      {permissions.canCreate && <button>Import</button>}
    </div>
  );
}

// ✅ BETTER - Dùng gate
function Toolbar() {
  const permissions = usePermissions();
  
  return (
    <PermissionGate permission="canCreate" permissions={permissions}>
      <div>
        <button>Create</button>
        <button>Upload</button>
        <button>Import</button>
      </div>
    </PermissionGate>
  );
}
```

### 3. Provide feedback khi disabled

```javascript
// ❌ BAD - User không biết tại sao không click được
<button disabled={!canCreate}>Create</button>

// ✅ GOOD - Có tooltip giải thích
<button 
  disabled={!canCreate}
  title={!canCreate ? "Bạn cần quyền Teacher để tạo mới" : "Tạo file mới"}
>
  Create
</button>

// ✅ BETTER - Hiện message rõ ràng
{!canCreate ? (
  <div className="info-box">
    <p>Bạn cần quyền Teacher để tạo file mới.</p>
    <a href="/upgrade">Nâng cấp tài khoản</a>
  </div>
) : (
  <button>Create</button>
)}
```

## 📊 Permission Check Checklist

Khi implement feature mới, check list này:

- [ ] Server-side permission check trong action/loader
- [ ] Client-side UI ẩn/hiện dựa trên permissions
- [ ] Error handling cho unauthorized actions
- [ ] Feedback cho user khi không có quyền
- [ ] Test với tất cả roles (ADMIN, MANAGER, TEACHER, STUDENT)
- [ ] Test ownership (TEACHER chỉ edit được của mình)

## 🧪 Testing UI Permissions

```javascript
// Test với các roles khác nhau
describe('FileList UI', () => {
  it('STUDENT không thấy Upload button', () => {
    const permissions = { isStudent: true, canCreate: false };
    render(<FileList permissions={permissions} />);
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
  });
  
  it('TEACHER thấy Upload button', () => {
    const permissions = { isTeacher: true, canCreate: true };
    render(<FileList permissions={permissions} />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });
  
  it('TEACHER chỉ thấy Edit button cho file của mình', () => {
    const file = { id: '1', ownerId: 'teacher-id' };
    const resourcePermissions = { canUpdate: true };
    render(<FileCard file={file} resourcePermissions={resourcePermissions} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
```

---

**Tóm lại:**
- ✅ Dùng hooks để lấy permissions
- ✅ Dùng gates để ẩn/hiện UI
- ✅ Luôn check server-side
- ✅ Provide feedback khi disabled
- ✅ Test với tất cả roles
