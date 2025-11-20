# Protected Routes - Implementation Summary

## ✅ Routes đã được protect

### 📝 Document Routes

#### 1. Create Document
**Route:** `/bang-dieu-khien/thong-tin-suu-tam/tao-moi/:categoryId`

**File:** `app/routes/document/documentCreate.jsx`

**Protection:**
- ✅ Require authentication
- ✅ Require create permission
- ❌ STUDENT → Redirect to `/bang-dieu-khien`

**Code:**
```javascript
export const loader = async ({ request, params }) => {
  const user = await requireAuth(request);
  
  try {
    requireCreatePermission(user);
  } catch (error) {
    throw redirect("/bang-dieu-khien");
  }
  // ... load category
};
```

#### 2. Edit Document
**Route:** `/bang-dieu-khien/thong-tin-suu-tam/chinh-sua/:documentId`

**File:** `app/routes/document/documentEdit.jsx`

**Protection:**
- ✅ Require authentication
- ✅ Require update permission
- ✅ Check ownership
- ❌ STUDENT → Redirect
- ❌ TEACHER (not owner) → Redirect

**Code:**
```javascript
export async function loader({ request, params }) {
  const user = await requireAuth(request);
  const document = await documentModel.findById(documentId);
  
  try {
    requireUpdatePermission(user, document);
  } catch (error) {
    throw redirect("/bang-dieu-khien");
  }
  // ... load document
}
```

### 📚 Lesson Routes

#### 3. Create Lesson
**Route:** `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/create/:classId?`

**File:** `app/routes/dashboard/createLesson.jsx`

**Protection:**
- ✅ Require authentication
- ✅ Require create permission
- ❌ STUDENT → Redirect to `/bang-dieu-khien`

#### 4. Edit Lesson
**Route:** `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/edit/:lessonId`

**File:** `app/routes/dashboard/editLesson.jsx`

**Protection:**
- ✅ Require authentication
- ✅ Require update permission
- ✅ Check ownership
- ❌ STUDENT → Redirect
- ❌ TEACHER (not owner) → Redirect

## 🎯 Protection Pattern

### Standard Pattern cho Create Routes:

```javascript
import { redirect } from "react-router";
import { requireAuth } from "../../service/auth.server";
import { requireCreatePermission } from "../../service/authorization.server";

export async function loader({ request, params }) {
  // 1. Require authentication
  const user = await requireAuth(request);
  
  // 2. Check create permission
  try {
    requireCreatePermission(user);
  } catch (error) {
    // 3. Redirect nếu không có quyền
    throw redirect("/bang-dieu-khien");
  }
  
  // 4. Load data
  // ...
  
  return { data };
}
```

### Standard Pattern cho Edit/Update Routes:

```javascript
import { redirect } from "react-router";
import { requireAuth } from "../../service/auth.server";
import { requireUpdatePermission } from "../../service/authorization.server";

export async function loader({ request, params }) {
  // 1. Require authentication
  const user = await requireAuth(request);
  
  // 2. Load resource
  const resource = await model.findById(params.id);
  
  if (!resource) {
    throw new Response("Not found", { status: 404 });
  }
  
  // 3. Check update permission (includes ownership check)
  try {
    requireUpdatePermission(user, resource);
  } catch (error) {
    // 4. Redirect nếu không có quyền
    throw redirect("/bang-dieu-khien");
  }
  
  return { resource };
}
```

## 🔐 Security Flow

### User tries to access protected route:

```
1. User navigates to /bang-dieu-khien/thong-tin-suu-tam/tao-moi/123
   ↓
2. Loader runs
   ↓
3. requireAuth(request)
   - Not logged in? → Redirect to /dang-nhap
   - Logged in? → Continue
   ↓
4. requireCreatePermission(user)
   - STUDENT? → throw Response (403)
   - TEACHER/MANAGER/ADMIN? → Continue
   ↓
5. Catch error
   - Has error? → Redirect to /bang-dieu-khien
   - No error? → Load data and render page
```

## 📋 Checklist cho Routes khác

Nếu bạn có routes khác cần protect:

### Create Routes:
- [ ] Import `requireAuth` và `requireCreatePermission`
- [ ] Call `requireAuth(request)` đầu tiên
- [ ] Wrap `requireCreatePermission(user)` trong try-catch
- [ ] Redirect to `/bang-dieu-khien` nếu có error

### Edit/Update Routes:
- [ ] Import `requireAuth` và `requireUpdatePermission`
- [ ] Call `requireAuth(request)` đầu tiên
- [ ] Load resource từ database
- [ ] Wrap `requireUpdatePermission(user, resource)` trong try-catch
- [ ] Redirect to `/bang-dieu-khien` nếu có error

### Delete Routes:
- [ ] Tương tự Edit, nhưng dùng `requireDeletePermission`

## 🧪 Testing

### Test Cases:

**STUDENT tries to create:**
```
1. Login as STUDENT
2. Navigate to /bang-dieu-khien/thong-tin-suu-tam/tao-moi/123
3. Expected: Redirect to /bang-dieu-khien
```

**TEACHER tries to edit own document:**
```
1. Login as TEACHER
2. Navigate to /bang-dieu-khien/thong-tin-suu-tam/chinh-sua/[own-doc-id]
3. Expected: Show edit page
```

**TEACHER tries to edit others' document:**
```
1. Login as TEACHER
2. Navigate to /bang-dieu-khien/thong-tin-suu-tam/chinh-sua/[other-doc-id]
3. Expected: Redirect to /bang-dieu-khien
```

**ADMIN/MANAGER tries to edit any document:**
```
1. Login as ADMIN or MANAGER
2. Navigate to /bang-dieu-khien/thong-tin-suu-tam/chinh-sua/[any-doc-id]
3. Expected: Show edit page
```

## 🎨 UI Integration

Đã ẩn/hiện UI elements:

### FolderTree Component:
- ✅ Edit button: Chỉ hiện nếu `permissions.canUpdate`
- ✅ Delete button: Chỉ hiện nếu `permissions.canDelete`
- ✅ Add category button: Chỉ hiện nếu `permissions.canCreate`

### Document List:
- ✅ "Thêm tài liệu" button: Chỉ hiện nếu `permissions.canCreate`

## 📊 Protection Summary

| Route Type | Auth | Permission Check | Ownership Check | Redirect Target |
|------------|------|------------------|-----------------|-----------------|
| **Create** | ✅ | `requireCreatePermission` | N/A | `/bang-dieu-khien` |
| **Edit** | ✅ | `requireUpdatePermission` | ✅ (auto) | `/bang-dieu-khien` |
| **Delete** | ✅ | `requireDeletePermission` | ✅ (auto) | `/bang-dieu-khien` |
| **View** | ✅ | None (all can view) | N/A | N/A |

## 🚀 Next Steps

### Routes còn lại cần protect:

1. **Category routes** (nếu có dedicated create/edit pages)
2. **File upload routes** (nếu có UI page)
3. **Admin routes** - Cần `requireAdminOrManager`

### Recommended:

1. **Add flash messages** - Thông báo "Bạn không có quyền truy cập" khi redirect
2. **Custom error pages** - 403 Forbidden page thay vì redirect
3. **Audit logging** - Log unauthorized access attempts

---

**Last Updated:** 2025-11-20

**Status:** ✅ Core routes protected with permission checks and redirects
