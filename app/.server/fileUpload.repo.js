// app/models/FileModel.js
import { BaseModel } from "./base.repo";
import { CloudinaryRepo } from "./cloudinary.repo";
import { UserModel } from "./user.repo";

export class FileModel extends BaseModel {
  cloudinaryRepo;
  userRepo;
  constructor() {
    super("file");
    this.cloudinaryRepo = new CloudinaryRepo();
    this.userRepo = new UserModel();
  }

  async uploadFileToCloudinary(file, folder = "general", userId = null, extraData = {}) {
    const originalFilename = file.name;
    const fileType = file.type;
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    const result = await this.cloudinaryRepo.upload(file, folder);
    if (!result) throw new Error("Upload file thất bại");
    
    // Use Cloudinary's resource_type directly
    const resourceType = result.resource_type;
    
    // Use secure_url from Cloudinary
    const url = result.secure_url;
    const downloadUrl = result.secure_url;
    const dataUpdate = {
      filename: originalFilename,
      url: url,
      publicId: result.public_id,
      downloadUrl: downloadUrl,
      name: extraData?.name,
      description: extraData?.description,
      classes: extraData?.classes || [],
      type: resourceType,
      size: result.bytes,
      src: 'cloudinary',
      detail: result,
      ownerId: userId,
      ownerName: user.name,
    }
    if (extraData?.category) dataUpdate.category = extraData.category;
    return this.createFile(dataUpdate);
  }

  /**
   * Filter files với phân trang
   * @param {Object} filters - Các điều kiện lọc
   * @param {string} filters.search - Tìm kiếm theo tên, filename, description
   * @param {Array<string>} filters.types - Lọc theo nhiều loại file (image, video, audio, etc.)
   * @param {Array<number>} filters.classes - Lọc theo danh sách classes
   * @param {string} filters.dateFrom - Lọc từ ngày
   * @param {string} filters.dateTo - Lọc đến ngày
   * @param {string} filters.owner - Lọc theo tên người tạo
   * @param {string} filters.category - Lọc theo category
   * @param {number} page - Trang hiện tại (default: 1)
   * @param {number} limit - Số lượng items mỗi trang (default: 20)
   * @returns {Promise<{files: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async findWithFilters(filters = {}, page = 1, limit = 20) {
    try {
      // Build where clause
      const where = {};

      // Search filter (tìm trong name, filename, description)
      if (filters.search && filters.search.trim()) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { filename: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Type filter
      if (filters.types && Array.isArray(filters.types) && filters.types.length > 0) {
        where.type = {
          in: filters.types, // in cho string/int
        };
      }


      // Classes filter (chứa ít nhất 1 class trong danh sách)
      if (filters.classes && Array.isArray(filters.classes) && filters.classes.length > 0) {
        where.classes = {
          hasSome: filters.classes.map(cls => Number(cls)),
        };
      }

      // Date range filter
      console.log(filters, "filters1");
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          const dateTo = new Date(filters.dateTo);
          dateTo.setHours(23, 59, 59, 999); // End of day
          where.createdAt.lte = dateTo;
        }
      }

      // Owner filter
      if (filters.owner && filters.owner.trim()) {
        where.ownerName = {
          contains: filters.owner,
          mode: 'insensitive',
        };
      }

      // Category filter
      if (filters.category && filters.category.trim()) {
        where.category = filters.category;
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20)); // Max 100 items per page
      const skip = (pageNum - 1) * limitNum;

      // Execute queries in parallel
      const [files, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        this.model.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        files,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      };
    } catch (error) {
      console.error('Error in findWithFilters:', error);
      throw new Error('Không thể lọc files: ' + error.message);
    }
  }

  /**
   * Tìm files theo nhiều classes (file phải có TẤT CẢ classes)
   */
  async findByAllClasses(classes = [], page = 1, limit = 20) {
    const where = {
      AND: classes.map(cls => ({
        classes: { has: Number(cls) },
      })),
    };

    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.model.count({ where }),
    ]);

    return {
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByLesson(lessonId) {
    return this.findMany({ lessonId });
  }

  async findByType(type) {
    return this.findMany({
      type,
    });
  }

  async createFile(data) {
    return this.create(data);
  }

  async deleteByLesson(lessonId) {
    return this.model.deleteMany({ where: { lessonId } });
  }

  async updateFile(fileId, data) {
    if (!fileId) throw new Error("File ID is required");
    if (!data) throw new Error("Data is required");
    if (data.id) delete data.id;
    return this.model.update({ where: { id: fileId }, data });
  }

  async deleteFile(fileId) {
    if (!fileId) throw new Error("File ID is required");
    return this.model.delete({ where: { id: fileId } });
  }
}

export default FileModel;