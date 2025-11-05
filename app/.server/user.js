import { BaseModel } from "./baseModel.server";

export class UserModel extends BaseModel {
  constructor() {
    super("user");
  }

  async findByEmail(email) {
    return this.model.findUnique({
      where: { email },
    });
  }

  async findTeachers() {
    return this.model.findMany({
      where: { role: "TEACHER" },
    });
  }
}

export const userModel = new UserModel();
