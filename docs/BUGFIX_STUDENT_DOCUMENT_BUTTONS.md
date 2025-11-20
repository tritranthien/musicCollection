# Fix STUDENT Sees Edit/Delete Buttons in Document List

## Problem
STUDENT thấy nút Edit (✏️) và Delete (🗑️) trong document list, mặc dù không có quyền.

## Locations to Fix

### 1. Table Row Actions (Lines 231-244)
**File:** `app/routes/document.jsx`

**Current code:**
```javascript
<button
  className={`${styles.actionIcon} ${styles.editIcon}`}
  onClick={(e) => handleEditDocument(e, document.id)}
  title="Chỉnh sửa"
>
  ✏️
</button>
<button
  className={`${styles.actionIcon} ${styles.deleteIcon}`}
  onClick={(e) => handleDeleteClick(e, document)}
  title="Xóa"
>
  🗑️
</button>
```

**Fix:**
```javascript
{(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && document.ownerId === permissions.userId)) && (
  <>
    <button
      className={`${styles.actionIcon} ${styles.editIcon}`}
      onClick={(e) => handleEditDocument(e, document.id)}
      title="Chỉnh sửa"
    >
      ✏️
    </button>
    <button
      className={`${styles.actionIcon} ${styles.deleteIcon}`}
      onClick={(e) => handleDeleteClick(e, document)}
      title="Xóa"
    >
      🗑️
    </button>
  </>
)}
```

### 2. Detail Panel Actions (Lines 449-466)
**Current code:**
```javascript
<button
  className={`${styles.detailActionButton} ${styles.editDetailButton}`}
  onClick={() => navigate(`/bang-dieu-khien/thong-tin-suu-tam/chinh-sua/${selectedDocument.id}`)}
>
  ✏️ Chỉnh sửa tài liệu
</button>
<button
  className={`${styles.detailActionButton} ${styles.viewDetailButton}`}
  onClick={handleViewContent}
>
  👁️ Xem toàn bộ nội dung
</button>
<button
  className={`${styles.detailActionButton} ${styles.deleteDetailButton}`}
  onClick={(e) => handleDeleteClick(e, selectedDocument)}
>
  🗑️ Xóa tài liệu
</button>
```

**Fix:**
```javascript
{(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && selectedDocument.ownerId === permissions.userId)) && (
  <button
    className={`${styles.detailActionButton} ${styles.editDetailButton}`}
    onClick={() => navigate(`/bang-dieu-khien/thong-tin-suu-tam/chinh-sua/${selectedDocument.id}`)}
  >
    ✏️ Chỉnh sửa tài liệu
  </button>
)}
<button
  className={`${styles.detailActionButton} ${styles.viewDetailButton}`}
  onClick={handleViewContent}
>
  👁️ Xem toàn bộ nội dung
</button>
{(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && selectedDocument.ownerId === permissions.userId)) && (
  <button
    className={`${styles.detailActionButton} ${styles.deleteDetailButton}`}
    onClick={(e) => handleDeleteClick(e, selectedDocument)}
  >
    🗑️ Xóa tài liệu
  </button>
)}
```

## Permission Logic

```javascript
permissions.isAdmin ||                                    // ADMIN can edit/delete all
permissions.isManager ||                                  // MANAGER can edit/delete all
(permissions.isTeacher && document.ownerId === permissions.userId)  // TEACHER can only edit/delete own
```

## Testing

### STUDENT
- ✅ Thấy nút View (👁️)
- ❌ KHÔNG thấy nút Edit (✏️)
- ❌ KHÔNG thấy nút Delete (🗑️)

### TEACHER
- ✅ Thấy nút View cho tất cả documents
- ✅ Thấy nút Edit/Delete cho documents của mình
- ❌ KHÔNG thấy Edit/Delete cho documents của người khác

### ADMIN/MANAGER
- ✅ Thấy nút View/Edit/Delete cho TẤT CẢ documents

---

**Manual Edit Required:** Please manually apply the changes above to `document.jsx` as the automated replacement failed due to file complexity.
