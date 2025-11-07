// app/models/FileModel.js
import { BaseModel } from "./base.repo";
import { CloudinaryRepo } from "./cloudinary.repo";

export class FileModel extends BaseModel {
  cloudinaryRepo;
  constructor() {
    super("file");
    this.cloudinaryRepo = new CloudinaryRepo();
  }

  async uploadFileToCloudinary(file, folder = "general", userId = null) {
    const result = await this.cloudinaryRepo.upload(file, folder);
    if (!result) throw new Error("Upload file thất bại");
    
    return this.createFile({
      filename: result.original_filename,
      url: result.secure_url,
      type: result.resource_type,
      size: result.bytes,
      src: 'cloudinary',
      detail: result,
      ownerId: userId,
    });
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
}
export default FileModel;
