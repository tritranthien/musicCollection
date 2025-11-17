// document.repo.js
import { BaseModel } from './base.repo';

export class DocumentModel extends BaseModel {
  constructor() {
    super('document');
  }

  /**
   * Tìm tất cả documents với owner và category
   */
  async findAll(options = {}) {
    return super.findAll({}, {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...options,
    });
  }

  /**
   * Tìm document theo ID với relations
   */
  async findById(id, options = {}) {
    return super.findById(id, {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      ...options,
    });
  }

  /**
   * Tìm documents theo category
   */
  async findByCategory(categoryId) {
    return this.findMany(
      categoryId ? { categoryId } : {},
      {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }
    );
  }

  /**
   * Tìm documents theo classes
   */
  async findByClass(classId) {
    return this.findMany(
      {
        classes: {
          has: classId,
        },
      },
      {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }
    );
  }

  /**
   * Tạo document mới
   */
  async create(data) {
    return super.create({
      title: data.title,
      description: data.description || null,
      content: data.content,
      classes: data.classes || [],
      categoryId: data.categoryId || null,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
    });
  }

  /**
   * Cập nhật document
   */
  async update(id, data) {
    const updateData = {
      title: data.title,
      description: data.description,
      content: data.content,
    };

    if (data.classes !== undefined) {
      updateData.classes = data.classes;
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    return super.update(id, updateData);
  }

  /**
   * Tìm kiếm documents
   */
  async search(searchTerm, filters = {}) {
    const where = {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.classId) {
      where.classes = {
        has: filters.classId,
      };
    }

    return this.findMany(where, {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}