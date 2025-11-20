
const generateGradeMenuData = () => {
  const menuData = [];
  for (let i = 1; i <= 12; i++) {
    menuData.push({
      label: `Lớp ${i}`,
      path: `/bang-dieu-khien/chuong-trinh-hoc/${i}`,
      edit: false,
      icon: '👥',
      children: [
        { icon: '📚', label: 'Bài giảng', path: `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/${i}`, custom: false, edit: false },
        { icon: '🎬', label: 'Video', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/video`, custom: false, edit: false },
        { icon: '🖼️', label: 'Hình ảnh', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/hinh-anh`, custom: false, edit: false },
        { icon: '🎧', label: 'Âm thanh', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/am-thanh`, custom: false, edit: false },
        { icon: '📄', label: 'Tài liệu', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/tai-lieu`, custom: false, edit: false },
      ]
    });
  }
  return menuData;
}
export const menuData = [
  {
    label: 'Bang điều khiển',
    path: '/bang-dieu-khien',
    icon: '🏠',
    edit: false,
  },
  {
    label: 'Quản lý người dùng',
    path: '/bang-dieu-khien/admin',
    icon: '👥',
    edit: false,
  },
  {
    label: 'Chương trình học',
    path: '/chuong-trinh-hoc',
    icon: '🎓',
    custom: false,
    edit: false,
    children: generateGradeMenuData()
  }
];