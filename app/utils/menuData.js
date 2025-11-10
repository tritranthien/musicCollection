
const generateGradeMenuData = () => {
    const menuData = [];
    for (let i = 1; i <= 12; i++) {
        menuData.push({
            label: `Lớp ${i}`,
            path: `/bang-dieu-khien/chuong-trinh-hoc/${i}`,
            icon: '👥',
            children: [
                { icon: '📚', label: 'Bài giảng', path: `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/${i}` },
                { icon: '🎬', label: 'Video', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/video` },
                { icon: '🖼️', label: 'Hình ảnh', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/hinh-anh` },
                { icon: '🎧', label: 'Âm thanh', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/am-thanh` },
                { icon: '📄', label: 'Tài liệu', path: `/bang-dieu-khien/chuong-trinh-hoc/${i}/tai-lieu` },
            ]
        });
    }
    return menuData;
}
export const menuData = [
  {
    label: 'Bang điều khiển',
    path: '/bang-dieu-khien',
    icon: '🏠'
  },
  {
    label: 'Chương trình học',
    path: '/chuong-trinh-hoc',
    icon: '👥',
    children: generateGradeMenuData()
  },
  {
    label: 'Sưu tập',
    path: '/suu-tap',
    icon: '👥',
    children: [
      { icon: '🎬', label: 'Video', path: `/bang-dieu-khien/suu-tap/video` },
      { icon: '🖼️', label: 'Hình ảnh', path: `/bang-dieu-khien/suu-tap/hinh-anh` },
      { icon: '🎧', label: 'Âm thanh', path: `/bang-dieu-khien/suu-tap/am-thanh` },
      { icon: '📄', label: 'Tài liệu', path: `/bang-dieu-khien/suu-tap/tai-lieu` },
    ]
  }
];