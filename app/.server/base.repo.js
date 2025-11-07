import { prisma } from "../utils/db.server";
export class BaseModel {
  constructor(modelName) {
    if (!modelName || !prisma[modelName]) {
      throw new Error(`Invalid model name: ${modelName}`);
    }
    this.model = prisma[modelName];
  }

  async findAll(where = {}, options = {}) {
    return this.model.findMany({
      where,
      ...options,
    });
  }

  async findById(id, options = {}) {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  async create(data) {
    return this.model.create({ data });
  }

  async update(id, data) {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where = {}) {
    return this.model.count({ where });
  }

  async findMany(where = {}, options = {}) {
    return this.model.findMany({
      where,
      ...options,
    });
  }
}
export default BaseModel;
