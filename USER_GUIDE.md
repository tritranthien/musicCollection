# 📚 Hướng dẫn sử dụng - Hệ thống Quản lý Tài nguyên Âm Nhạc

## 📖 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Đăng ký và Đăng nhập](#đăng-ký-và-đăng-nhập)
3. [Các vai trò người dùng](#các-vai-trò-người-dùng)
4. [Tính năng chính](#tính-năng-chính)
5. [Hướng dẫn chi tiết theo vai trò](#hướng-dẫn-chi-tiết-theo-vai-trò)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## 🎯 Giới thiệu

**Hệ thống Quản lý Tài nguyên Âm Nhạc** là nền tảng quản lý và chia sẻ tài liệu, bài giảng, và tài nguyên âm nhạc dành cho giáo viên và học sinh.

### Tính năng nổi bật:
- ✅ Quản lý tài liệu với Tiptap Editor (hỗ trợ rich text, bảng, hình ảnh)
- ✅ Upload và quản lý files đa phương tiện (video, audio, hình ảnh, PDF)
- ✅ Tạo và quản lý bài giảng theo lớp học
- ✅ Export tài liệu ra PDF và Word
- ✅ Tìm kiếm và lọc nâng cao
- ✅ Phân quyền chi tiết theo vai trò
- ✅ Responsive design - hoạt động tốt trên mọi thiết bị

---

## 🔐 Đăng ký và Đăng nhập

### Đăng ký tài khoản mới

1. **Truy cập trang đăng ký**: `/dang-ky`
2. **Điền thông tin**:
   - Email (phải là email hợp lệ)
   - Tên đầy đủ
   - Mật khẩu (tối thiểu 6 ký tự)
   - Chọn vai trò: **Học sinh** hoặc **Giáo viên**

3. **Quy trình kích hoạt**:

   **Nếu bạn đăng ký là Học sinh:**
   - Hệ thống gửi email xác thực
   - Click vào link trong email để kích hoạt tài khoản
   - Sau khi xác thực → Đăng nhập ngay

   **Nếu bạn đăng ký là Giáo viên:**
   - Tài khoản ở trạng thái "Chờ phê duyệt"
   - Admin/Manager sẽ xem xét và phê duyệt
   - Bạn nhận email thông báo khi được phê duyệt
   - Sau khi được phê duyệt → Đăng nhập

### Đăng nhập

1. **Truy cập trang đăng nhập**: `/dang-nhap`
2. **Nhập email và mật khẩu**
3. **Click "Đăng nhập"**
4. Hệ thống tự động chuyển đến **Bảng điều khiển**

### Đăng xuất

- Click vào menu người dùng (góc trên bên phải)
- Chọn **"Đăng xuất"**

---

## 👥 Các vai trò người dùng

### 1. 🎓 **Học sinh (STUDENT)**

**Quyền hạn:**
- ✅ Xem tài liệu, bài giảng
- ✅ Tải xuống files
- ✅ Tìm kiếm nội dung
- ❌ Không thể tạo, sửa, xóa nội dung

**Kích hoạt:** Xác thực email → Đăng nhập ngay

---

### 2. 👨‍🏫 **Giáo viên (TEACHER)**

**Quyền hạn:**
- ✅ Tất cả quyền của Học sinh
- ✅ Tạo, sửa, xóa **tài liệu của mình**
- ✅ Upload, quản lý **files của mình**
- ✅ Tạo, sửa, xóa **bài giảng của mình**
- ✅ Export tài liệu ra PDF/Word
- ❌ Không thể sửa/xóa nội dung của người khác
- ❌ Không thể quản lý người dùng

**Kích hoạt:** Chờ Admin/Manager phê duyệt

---

### 3. 👔 **Quản lý (MANAGER)**

**Quyền hạn:**
- ✅ Tất cả quyền của Giáo viên
- ✅ Sửa, xóa **tất cả** tài liệu, files, bài giảng
- ✅ Phê duyệt/từ chối tài khoản Giáo viên
- ✅ Quản lý danh mục (categories)
- ❌ Không thể nâng/hạ cấp vai trò

**Kích hoạt:** Được Admin nâng cấp từ Giáo viên

---

### 4. 👑 **Quản trị viên (ADMIN)**

**Quyền hạn:**
- ✅ **Toàn quyền** trong hệ thống
- ✅ Phê duyệt/từ chối tài khoản Giáo viên
- ✅ Nâng cấp Giáo viên → Quản lý
- ✅ Hạ cấp Quản lý → Giáo viên
- ✅ Quản lý tất cả nội dung và người dùng

**Kích hoạt:** Tài khoản được tạo sẵn khi khởi tạo hệ thống

---

## 🎯 Tính năng chính

### 1. 📊 Bảng điều khiển (Dashboard)

**Truy cập:** `/bang-dieu-khien` (trang mặc định sau khi đăng nhập)

**Hiển thị:**
- 📈 Thống kê tổng quan (số lượng tài liệu, files, bài giảng, người dùng)
- 📝 Hoạt động gần đây (tài liệu, files, bài giảng mới nhất)
- 👤 Nội dung của tôi (chỉ Giáo viên/Manager/Admin)
- 🔧 Trạng thái hệ thống (chỉ Admin)

**Thao tác:**
- Click vào các mục để xem chi tiết
- Sử dụng nút "Xem tất cả" để đến trang danh sách đầy đủ

---

### 2. 📚 Quản lý Tài liệu (Documents)

#### 2.1. Xem danh sách tài liệu

**Truy cập:** `/bang-dieu-khien/thong-tin-suu-tam/:categorySlug`

**Tính năng:**
- Xem danh sách tài liệu theo danh mục
- Lọc theo lớp học (1-12)
- Tìm kiếm theo tiêu đề, người tạo
- Sắp xếp theo ngày tạo

**Thao tác:**
- Click vào tài liệu để xem chi tiết
- Sử dụng bộ lọc ở sidebar bên trái

#### 2.2. Xem chi tiết tài liệu

**Truy cập:** `/bang-dieu-khien/thong-tin-suu-tam/xem/:documentId`

**Hiển thị:**
- Tiêu đề và mô tả
- Nội dung đầy đủ (rich text với bảng, hình ảnh, định dạng)
- Thông tin người tạo và ngày tạo
- Các lớp học áp dụng

**Thao tác (Giáo viên/Manager/Admin):**
- 📥 **Export PDF**: Tải tài liệu dưới dạng PDF
- 📄 **Export Word**: Tải tài liệu dưới dạng DOCX
- ✏️ **Chỉnh sửa**: Sửa nội dung (chỉ owner hoặc Manager/Admin)
- 🗑️ **Xóa**: Xóa tài liệu (chỉ owner hoặc Manager/Admin)

#### 2.3. Tạo tài liệu mới

**Truy cập:** `/bang-dieu-khien/thong-tin-suu-tam/tao-moi/:categoryId`

**Quyền hạn:** Giáo viên, Manager, Admin

**Các bước:**
1. Chọn danh mục từ sidebar
2. Click nút **"+ Tạo tài liệu mới"**
3. Điền thông tin:
   - **Tiêu đề** (bắt buộc)
   - **Mô tả** (tùy chọn)
   - **Nội dung** (sử dụng Tiptap Editor)
   - **Lớp học** (chọn một hoặc nhiều lớp từ 1-12)
4. Click **"Tạo tài liệu"**

**Tiptap Editor - Công cụ soạn thảo:**
- **Định dạng văn bản**: Bold, Italic, Underline, Strikethrough
- **Tiêu đề**: H1, H2, H3
- **Danh sách**: Bullet list, Numbered list, Task list
- **Bảng**: Chèn và chỉnh sửa bảng
- **Hình ảnh**: Upload và chèn hình ảnh
- **Link**: Thêm liên kết
- **Code block**: Chèn code với syntax highlighting
- **Blockquote**: Trích dẫn
- **Căn chỉnh**: Left, Center, Right, Justify

#### 2.4. Chỉnh sửa tài liệu

**Truy cập:** `/bang-dieu-khien/thong-tin-suu-tam/chinh-sua/:documentId`

**Quyền hạn:** 
- Owner (người tạo)
- Manager/Admin (có thể sửa tất cả)

**Thao tác:**
1. Mở tài liệu cần sửa
2. Click nút **"Chỉnh sửa"**
3. Cập nhật thông tin
4. Click **"Lưu thay đổi"**

#### 2.5. Xóa tài liệu

**Quyền hạn:**
- Owner (người tạo)
- Manager/Admin (có thể xóa tất cả)

**Thao tác:**
1. Mở tài liệu cần xóa
2. Click nút **"Xóa"**
3. Xác nhận xóa trong hộp thoại

⚠️ **Lưu ý:** Hành động xóa không thể hoàn tác!

---

### 3. 📁 Quản lý Files

#### 3.1. Xem danh sách files

**Truy cập:** 
- `/bang-dieu-khien/suu-tap/:file_type` (Sưu tập)
- `/bang-dieu-khien/chuong-trinh-hoc/:class/:file_type` (Theo lớp học)

**Loại files hỗ trợ:**
- 🎥 **Video**: MP4, AVI, MOV, WebM
- 🎵 **Audio**: MP3, WAV, OGG, M4A
- 🖼️ **Hình ảnh**: JPG, PNG, GIF, WebP
- 📄 **Tài liệu**: PDF, DOC, DOCX, PPT, PPTX

**Tính năng:**
- Lọc theo lớp học, danh mục
- Tìm kiếm theo tên file, người upload
- Sắp xếp theo ngày, kích thước
- Xem dạng lưới (Grid) hoặc danh sách (List)

#### 3.2. Upload file mới

**Quyền hạn:** Giáo viên, Manager, Admin

**Các bước:**
1. Vào trang quản lý files
2. Click nút **"📤 Upload"**
3. Chọn file từ máy tính
4. Điền thông tin:
   - **Tên file** (tùy chọn, mặc định là tên file gốc)
   - **Mô tả** (tùy chọn)
   - **Danh mục** (chọn từ dropdown)
   - **Lớp học** (chọn một hoặc nhiều lớp)
5. Click **"Upload"**

**Giới hạn:**
- Kích thước tối đa: 100MB/file
- Hỗ trợ upload nhiều files cùng lúc

#### 3.3. Xem và tải file

**Tất cả người dùng:**
- Click vào file để xem preview (nếu hỗ trợ)
- Click nút **"⬇️ Tải xuống"** để download

**Giáo viên/Manager/Admin:**
- ✏️ **Chỉnh sửa**: Cập nhật thông tin file
- 🗑️ **Xóa**: Xóa file (chỉ owner hoặc Manager/Admin)

---

### 4. 📖 Quản lý Bài giảng (Lessons)

#### 4.1. Xem danh sách bài giảng

**Truy cập:** `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/:classId`

**Tính năng:**
- Xem bài giảng theo lớp (1-12)
- Lọc theo người tạo, ngày tạo
- Tìm kiếm theo tiêu đề
- Expand/Collapse để xem chi tiết

**Hiển thị:**
- Tiêu đề và mô tả bài giảng
- Danh sách files đính kèm
- Danh sách tài liệu đính kèm
- Thông tin người tạo

#### 4.2. Tạo bài giảng mới

**Truy cập:** `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/create/:classId?`

**Quyền hạn:** Giáo viên, Manager, Admin

**Các bước:**
1. Chọn lớp học từ menu
2. Click nút **"+ Tạo bài giảng"**
3. Điền thông tin:
   - **Tiêu đề** (bắt buộc)
   - **Mô tả** (tùy chọn)
   - **Lớp học** (chọn từ 1-12)
4. **Thêm nội dung:**
   - **Files**: Click "Thêm File" → Chọn từ danh sách files có sẵn
   - **Tài liệu**: Click "Thêm Tài liệu" → Chọn từ danh sách tài liệu
5. Click **"Tạo bài giảng"**

#### 4.3. Xem chi tiết bài giảng

**Thao tác:**
- Click vào bài giảng để expand/collapse
- Xem danh sách files và tài liệu đính kèm
- Click vào file/tài liệu để xem chi tiết

**Tính năng đặc biệt:**
- 📥 **Tải tất cả files**: Download tất cả files trong bài giảng dưới dạng ZIP
- 🎵 **Phát nhạc**: Phát audio/video trực tiếp
- 📄 **Xem tài liệu**: Xem nội dung tài liệu đính kèm

#### 4.4. Chỉnh sửa bài giảng

**Truy cập:** `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/edit/:lessonId`

**Quyền hạn:**
- Owner (người tạo)
- Manager/Admin (có thể sửa tất cả)

**Thao tác:**
1. Click nút **"✏️ Chỉnh sửa"** trên bài giảng
2. Cập nhật thông tin, thêm/xóa files và tài liệu
3. Click **"Lưu thay đổi"**

#### 4.5. Xóa bài giảng

**Quyền hạn:**
- Owner (người tạo)
- Manager/Admin (có thể xóa tất cả)

**Thao tác:**
1. Click nút **"🗑️ Xóa"** trên bài giảng
2. Xác nhận xóa trong hộp thoại

⚠️ **Lưu ý:** Xóa bài giảng không xóa files và tài liệu đính kèm

---

### 5. 🔍 Tìm kiếm

Hệ thống cung cấp 3 loại tìm kiếm:

#### 5.1. Tìm kiếm Files

**Truy cập:** `/bang-dieu-khien/tim-kiem`

**Tìm kiếm theo:**
- Tên file
- Người upload
- Loại file (video, audio, image, document)
- Lớp học
- Danh mục

#### 5.2. Tìm kiếm Tài liệu

**Truy cập:** `/bang-dieu-khien/tim-kiem-tai-lieu`

**Tìm kiếm theo:**
- Tiêu đề
- Mô tả
- Người tạo
- Lớp học
- Danh mục

#### 5.3. Tìm kiếm Bài giảng

**Truy cập:** `/bang-dieu-khien/tim-kiem-bai-giang`

**Tìm kiếm theo:**
- Tiêu đề
- Mô tả
- Người tạo
- Lớp học

**Mẹo tìm kiếm:**
- Sử dụng từ khóa ngắn gọn
- Kết hợp nhiều bộ lọc để thu hẹp kết quả
- Sử dụng nút "Reset" để xóa bộ lọc

---

### 6. 🗂️ Quản lý Danh mục (Categories)

**Truy cập:** `/bang-dieu-khien/tuy-chinh/:category`

**Quyền hạn:** Manager, Admin

**Tính năng:**
- Tạo danh mục mới
- Sửa tên và mô tả danh mục
- Xóa danh mục (nếu không có nội dung)
- Gán danh mục cho files và tài liệu

**Danh mục mặc định:**
- Lý thuyết âm nhạc
- Nhạc cụ
- Lịch sử âm nhạc
- Kỹ thuật biểu diễn
- Sáng tác
- ...

---

### 7. 👥 Quản lý Người dùng (Admin/Manager)

**Truy cập:** `/bang-dieu-khien/admin`

**Quyền hạn:** Manager, Admin

#### 7.1. Xem danh sách người dùng

**Hiển thị:**
- Tên, email, vai trò
- Trạng thái tài khoản
- Ngày đăng ký
- Thống kê (tổng số người dùng theo vai trò, trạng thái)

**Lọc:**
- Theo vai trò (ADMIN, MANAGER, TEACHER, STUDENT)
- Theo trạng thái (PENDING, ACTIVE, APPROVED, REJECTED)
- Tìm kiếm theo tên, email

#### 7.2. Phê duyệt Giáo viên

**Quyền hạn:** Manager, Admin

**Thao tác:**
1. Vào trang quản lý người dùng
2. Lọc người dùng có trạng thái **"PENDING"** và vai trò **"TEACHER"**
3. Click nút **"✅ Phê duyệt"** hoặc **"❌ Từ chối"**
4. Người dùng nhận email thông báo

#### 7.3. Nâng/Hạ cấp vai trò

**Quyền hạn:** Chỉ ADMIN

**Thao tác:**
- **Nâng cấp TEACHER → MANAGER**: Click **"⬆️ Nâng cấp"**
- **Hạ cấp MANAGER → TEACHER**: Click **"⬇️ Hạ cấp"**

⚠️ **Lưu ý:** Chỉ Admin mới có quyền thay đổi vai trò

---

## 📱 Sử dụng trên Mobile

Hệ thống được thiết kế responsive, hoạt động tốt trên mọi thiết bị.

### Menu Hamburger (Mobile)

**Truy cập:** Click icon ☰ ở góc trên bên trái

**Chức năng:**
- Điều hướng giữa các trang
- Truy cập nhanh các chức năng chính
- Xem thông tin người dùng
- Đăng xuất

### Tối ưu cho Mobile:

- ✅ Giao diện tự động điều chỉnh theo kích thước màn hình
- ✅ Menu sidebar thu gọn thành hamburger menu
- ✅ Bảng và danh sách tự động scroll ngang
- ✅ Nút bấm và form được tối ưu cho cảm ứng
- ✅ Upload file hỗ trợ camera và thư viện ảnh

---

## 🎨 Giao diện và Trải nghiệm

### Chủ đề màu sắc

- **Xanh dương**: Tài liệu
- **Tím**: Files
- **Xanh lá**: Bài giảng
- **Cam**: Người dùng (Admin/Manager)
- **Đỏ**: Hành động nguy hiểm (xóa)

### Biểu tượng (Icons)

- 📚 Tài liệu
- 📁 Files
- 📖 Bài giảng
- 👤 Người dùng
- 🔍 Tìm kiếm
- ⚙️ Cài đặt
- 📥 Tải xuống
- 📤 Upload
- ✏️ Chỉnh sửa
- 🗑️ Xóa

---

## 💡 Mẹo và Thủ thuật

### 1. Tổ chức nội dung hiệu quả

- **Đặt tên rõ ràng**: Sử dụng tên mô tả cho files và tài liệu
- **Sử dụng danh mục**: Phân loại nội dung theo danh mục logic
- **Gắn lớp học**: Luôn chọn đúng lớp học để dễ tìm kiếm
- **Thêm mô tả**: Viết mô tả ngắn gọn giúp người khác hiểu nội dung

### 2. Tạo bài giảng chất lượng

- **Kết hợp nhiều loại nội dung**: Files + Tài liệu
- **Sắp xếp logic**: Đặt files theo thứ tự học tập
- **Thêm tài liệu hướng dẫn**: Tạo tài liệu giải thích cho files
- **Kiểm tra trước khi publish**: Xem lại tất cả links và files

### 3. Sử dụng Tiptap Editor

- **Sử dụng tiêu đề**: H1 cho tiêu đề chính, H2 cho phần, H3 cho mục con
- **Thêm bảng**: Sử dụng bảng để trình bày thông tin có cấu trúc
- **Chèn hình ảnh**: Minh họa bằng hình ảnh để dễ hiểu
- **Sử dụng danh sách**: Bullet list cho liệt kê, Numbered list cho các bước

### 4. Tìm kiếm nhanh

- **Sử dụng bộ lọc**: Kết hợp nhiều bộ lọc để tìm chính xác
- **Lưu tìm kiếm**: Bookmark các trang tìm kiếm thường dùng
- **Tìm theo người tạo**: Nhanh chóng tìm nội dung của một giáo viên cụ thể

### 5. Quản lý files

- **Đặt tên có ý nghĩa**: Tránh tên như "file1.mp3", "video.mp4"
- **Thêm mô tả chi tiết**: Giúp người khác hiểu nội dung mà không cần mở file
- **Sử dụng danh mục**: Phân loại files theo chủ đề
- **Kiểm tra định dạng**: Đảm bảo file tương thích với hệ thống

---

## ❓ Câu hỏi thường gặp (FAQ)

### 1. Tôi quên mật khẩu, làm sao để lấy lại?

**Trả lời:** Hiện tại hệ thống chưa hỗ trợ tính năng "Quên mật khẩu". Vui lòng liên hệ Admin để được hỗ trợ reset mật khẩu.

### 2. Tại sao tôi không thể đăng nhập dù đã đăng ký?

**Trả lời:**
- **Học sinh**: Kiểm tra email để xác thực tài khoản
- **Giáo viên**: Chờ Admin/Manager phê duyệt tài khoản

### 3. Tôi có thể upload file lớn hơn 100MB không?

**Trả lời:** Hiện tại giới hạn là 100MB/file. Nếu cần upload file lớn hơn, vui lòng liên hệ Admin để được hỗ trợ.

### 4. Làm sao để xóa nhiều files cùng lúc?

**Trả lời:** Hiện tại hệ thống chưa hỗ trợ xóa hàng loạt. Bạn cần xóa từng file một.

### 5. Tôi có thể chia sẻ tài liệu với người ngoài hệ thống không?

**Trả lời:** Hiện tại tất cả nội dung chỉ dành cho người dùng đã đăng nhập. Tính năng chia sẻ công khai sẽ được cập nhật trong tương lai.

### 6. Export PDF/Word có giữ nguyên định dạng không?

**Trả lời:** Có! Hệ thống sử dụng Puppeteer và html-to-docx để đảm bảo định dạng được giữ nguyên, bao gồm:
- Tiêu đề, đoạn văn
- Bảng (tables)
- Hình ảnh
- Danh sách
- Định dạng văn bản (bold, italic, underline)

### 7. Tôi có thể chỉnh sửa tài liệu của người khác không?

**Trả lời:**
- **Giáo viên**: Chỉ có thể sửa tài liệu của mình
- **Manager/Admin**: Có thể sửa tất cả tài liệu

### 8. Làm sao để tìm tất cả nội dung của một giáo viên?

**Trả lời:** Sử dụng chức năng tìm kiếm và lọc theo "Người tạo" hoặc "Người upload".

### 9. Tôi có thể thay đổi vai trò của mình không?

**Trả lời:** Không. Chỉ Admin mới có quyền thay đổi vai trò người dùng.

### 10. Hệ thống có hỗ trợ tiếng Việt không?

**Trả lời:** Có! Toàn bộ giao diện và nội dung đều hỗ trợ tiếng Việt.

---

## 🆘 Hỗ trợ

### Liên hệ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ:

1. **Email Admin**: admin@musiccollection.com
2. **Báo lỗi**: Mô tả chi tiết vấn đề và gửi email cho Admin
3. **Yêu cầu tính năng**: Gửi đề xuất qua email

### Báo cáo lỗi

Khi báo lỗi, vui lòng cung cấp:
- Mô tả chi tiết vấn đề
- Các bước để tái hiện lỗi
- Screenshot (nếu có)
- Trình duyệt và thiết bị đang sử dụng

---

## 📋 Phụ lục

### Danh sách lớp học

Hệ thống hỗ trợ 12 lớp học:
- Lớp 1, 2, 3, 4, 5, 6 (Tiểu học)
- Lớp 7, 8, 9 (THCS)
- Lớp 10, 11, 12 (THPT)

### Định dạng files hỗ trợ

**Video:**
- MP4, AVI, MOV, WebM, MKV

**Audio:**
- MP3, WAV, OGG, M4A, FLAC

**Hình ảnh:**
- JPG, JPEG, PNG, GIF, WebP, SVG

**Tài liệu:**
- PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX

### Phím tắt (Keyboard Shortcuts)

**Tiptap Editor:**
- `Ctrl + B`: Bold
- `Ctrl + I`: Italic
- `Ctrl + U`: Underline
- `Ctrl + Z`: Undo
- `Ctrl + Y`: Redo
- `Ctrl + K`: Thêm link

**Chung:**
- `Ctrl + F`: Tìm kiếm trong trang
- `Esc`: Đóng modal/dialog

---

## 🔄 Cập nhật

**Phiên bản hiện tại:** 1.0.0

**Lịch sử cập nhật:**
- **v1.0.0** (2025-11-21): Phiên bản đầu tiên
  - Quản lý tài liệu với Tiptap Editor
  - Upload và quản lý files
  - Tạo và quản lý bài giảng
  - Export PDF/Word
  - Phân quyền chi tiết
  - Responsive design

**Tính năng sắp tới:**
- [ ] Forgot password
- [ ] Chia sẻ công khai
- [ ] Comments và ratings
- [ ] Notifications
- [ ] Dark mode
- [ ] Bulk actions
- [ ] Advanced analytics

---

## 📞 Thông tin liên hệ

**Hệ thống Quản lý Tài nguyên Âm Nhạc**

- **Website:** https://your-domain.com
- **Email:** admin@musiccollection.com
- **GitHub:** https://github.com/tritran1409/musicCollection

---

**Cảm ơn bạn đã sử dụng hệ thống! 🎵**

*Tài liệu này được cập nhật lần cuối: 2025-11-21*
