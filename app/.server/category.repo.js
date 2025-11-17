// ==========================================
// 1. models/category.model.js
// ==========================================
import { BaseModel } from "./base.repo";

// Helper function để tạo slug từ tên
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-"); // Xóa dấu gạch ngang trùng lặp
}

export class CategoryModel extends BaseModel {
  constructor() {
    super("category");
  }

  async findAll() {
    return this.model.findMany();
  }
  // Tìm tất cả category của user
  async findByOwnerId(ownerId) {
    return this.model.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Tạo category mới
  async createCategory({ name, description, ownerId, rootPath }) {
    const slug = generateSlug(name);

    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.model.findUnique({
      where: { slug },
    });

    if (existing) {
      // Thêm số vào cuối nếu slug đã tồn tại
      const count = await this.model.count({
        where: {
          slug: {
            startsWith: slug,
          },
        },
      });
      return this.model.create({
        data: {
          name,
          slug: `${slug}-${count + 1}`,
          description,
          ownerId,
          rootPath
        },
      });
    }

    return this.model.create({
      data: {
        name,
        slug,
        description,
        ownerId,
        rootPath
      },
    });
  }

  // Cập nhật category
  async updateCategory(id, { name, description, rootPath }) {
    const data = {};
    
    if (name) {
      data.name = name;
      data.slug = generateSlug(name);
    }
    
    if (description !== undefined) {
      data.description = description;
    }
    
    if (rootPath !== undefined) {
      data.rootPath = rootPath;
    }

    return this.model.update({
      where: { id },
      data,
    });
  }

  // Tìm category theo slug
  async findBySlug(slug) {
    return this.model.findUnique({
      where: { slug },
    });
  }
}

export const categoryModel = new CategoryModel();