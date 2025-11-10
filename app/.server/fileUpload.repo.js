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
    console.log(user);
    
    return this.createFile({
      filename: originalFilename, // Keep original filename
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
  async updateFile(fileId, data) {
    if (!fileId) throw new Error("File ID is required");
    if (!data) throw new Error("Data is required");
    if (data.id) delete data.id;
    return this.model.update({ where: { id: fileId }, data });
  }
}
export default FileModel;