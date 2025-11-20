# Fix: usePermissions Hook - Route ID Missing

## 🐛 Vấn đề

`usePermissions()` hook trả về default permissions (tất cả `false`) thay vì permissions thực tế từ server.

→ TEACHER không thấy nút Upload/Edit/Delete mặc dù đã có quyền.

## 🔍 Root Cause

### 1. Hook đang tìm route ID không tồn tại

**`app/hooks/usePermissions.js`:**
```javascript
// ❌ Code cũ
const data = useRouteLoaderData("root") || useRouteLoaderData("dashboard");
```

### 2. Routes config không có ID

**`app/routes.ts`:**
```typescript
// ❌ Code cũ - KHÔNG có id
route("bang-dieu-khien", "routes/Dashboard.jsx", [
    // children...
]),
```

→ `useRouteLoaderData("dashboard")` trả về `undefined`
→ Hook fallback về default permissions (tất cả `false`)

## ✅ Giải pháp

### 1. Thêm `id` vào Dashboard route

**`app/routes.ts`:**
```typescript
// ✅ Code mới - CÓ id
route("bang-dieu-khien", "routes/Dashboard.jsx", {
    id: "dashboard",  // ← Thêm id
}, [
    // children...
]),
```

### 2. Cập nhật hook để chỉ dùng "dashboard"

**`app/hooks/usePermissions.js`:**
```javascript
// ✅ Code mới
export function usePermissions() {
    const data = useRouteLoaderData("dashboard");
    return data?.permissions || { /* defaults */ };
}

export function useUser() {
    const data = useRouteLoaderData("dashboard");
    return data?.user || null;
}
```

## 📊 Data Flow

```
1. User truy cập /bang-dieu-khien/*
   ↓
2. Dashboard.jsx loader chạy
   ↓
3. loader trả về: { user, permissions, menuList, ... }
   ↓
4. React Router lưu data với id="dashboard"
   ↓
5. useRouteLoaderData("dashboard") lấy được data
   ↓
6. usePermissions() trả về permissions thực tế
   ↓
7. UI hiển thị đúng buttons dựa trên permissions
```

## 🧪 Testing

### 1. Check trong Browser Console

```javascript
// Mở DevTools (F12) trong trang Dashboard
import { useRouteLoaderData } from "react-router";

// Trong component hoặc console
const data = useRouteLoaderData("dashboard");
console.log("Dashboard data:", data);
// Expected:
// {
//   user: { id: "...", role: "TEACHER", ... },
//   permissions: { canCreate: true, canUpdate: true, ... },
//   menuList: [...],
//   ...
// }
```

### 2. Test với TEACHER

1. **Login as TEACHER**
2. **Navigate to** `/bang-dieu-khien/suu-tap/video`
3. **Check console:**
   ```javascript
   const permissions = usePermissions();
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
4. **Verify UI:**
   - ✅ Thấy nút "Tải lên"
   - ✅ Thấy nút Edit/Delete cho resources của mình

### 3. Test với STUDENT

1. **Login as STUDENT**
2. **Check permissions:**
   ```javascript
   console.log(usePermissions());
   // Expected:
   // {
   //   canCreate: false,
   //   canUpdate: false,
   //   canDelete: false,
   //   isStudent: true
   // }
   ```
3. **Verify UI:**
   - ❌ KHÔNG thấy nút "Tải lên"
   - ❌ KHÔNG thấy nút Edit/Delete

## 📝 Files Changed

1. **`app/routes.ts`**
   - Thêm `id: "dashboard"` vào Dashboard route config

2. **`app/hooks/usePermissions.js`**
   - Sửa `usePermissions()` để chỉ dùng `"dashboard"`
   - Sửa `useUser()` để chỉ dùng `"dashboard"`
   - Cập nhật comments

## 🎯 React Router v7 Route ID Syntax

Trong React Router v7, để thêm options (như `id`) vào route, syntax là:

```typescript
// ✅ ĐÚNG - Options object giữa path và children
route(path, file, { id: "route-id" }, [children])

// ❌ SAI - Không có options
route(path, file, [children])
```

**Examples:**

```typescript
// Route với ID
route("dashboard", "routes/Dashboard.jsx", { id: "dashboard" }, [
    route("settings", "routes/Settings.jsx"),
])

// Layout với ID
layout("layouts/App.jsx", { id: "app" }, [
    route("home", "routes/Home.jsx"),
])

// Route với loader options
route("users/:id", "routes/User.jsx", {
    id: "user-detail",
    loader: true,
}, [])
```

## 🚀 Verification Steps

1. **Restart dev server** (nếu cần):
   ```bash
   # Ctrl+C để stop
   npm run dev
   ```

2. **Clear browser cache** và reload

3. **Login lại** để refresh session

4. **Check console** xem có warnings/errors không

5. **Test UI** với các roles khác nhau

## 💡 Best Practices

### 1. Luôn đặt ID cho parent routes

```typescript
// ✅ GOOD - Parent route có ID
route("dashboard", "Dashboard.jsx", { id: "dashboard" }, [
    route("users", "Users.jsx"),
    route("settings", "Settings.jsx"),
])
```

### 2. Sử dụng ID có ý nghĩa

```typescript
// ✅ GOOD - ID rõ ràng
{ id: "dashboard" }
{ id: "user-profile" }
{ id: "admin-panel" }

// ❌ BAD - ID mơ hồ
{ id: "route1" }
{ id: "page" }
```

### 3. Document route IDs

```typescript
// routes.ts
export default [
    // Main dashboard - provides user & permissions
    route("bang-dieu-khien", "routes/Dashboard.jsx", {
        id: "dashboard",  // ← Comment giải thích
    }, [
        // ...
    ]),
]
```

---

**Status:** ✅ Fixed

**Date:** 2025-11-20

**Impact:** `usePermissions()` bây giờ lấy được permissions thực tế từ Dashboard loader, TEACHER có thể thấy và sử dụng các nút Upload/Edit/Delete.
