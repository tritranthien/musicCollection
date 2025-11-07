import { Readable } from "stream";
import cloudinary from "../utils/cloudinary.server";

export class CloudinaryRepo {
    async upload(file, folder = "general") {
    if (!file || typeof file === "string") throw new Error("File không hợp lệ");

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `mcollection/${folder}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });

    const result = await uploadStream();

    return result;
  }

  async deleteByPublicId(publicId) {
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
    return { success: true };
  }
}
    