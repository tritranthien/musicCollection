import { redirect, useLoaderData } from "react-router";
import { FileModel } from "../.server/fileUpload.repo.js";
import FileLibraryLayout from "../components/common/FileLibraryLayout.jsx";

const fileModel = new FileModel();
const typeMap = {
  videos: "video",
  audios: "audio",
  images: "image",
  documents: "raw",
};
const acceptMap = {
  videos: "video/*",
  audios: "audio/*",
  images: "image/*",
  documents: ".txt, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf",
};
const viTypemap = {
    "am-thanh": "audios",
    "hinh-anh": "images",
    "tai-lieu": "documents",
    "video": "videos",
    "lectures": "lectures",
}
const viNameMap = {
    "audios": "Âm thanh",
    "images": "Hình ảnh",
    "documents": "Tài liệu",
    "videos": "Video",
    "lectures": "Bài giảng",
}
export async function loader({ params }) {
  let fileType = params.file_type;
  fileType = viTypemap[fileType];
  let classMate = params.class;
  if (!["videos", "audios", "images", "documents"].includes(fileType)) {
    return redirect("/bang-dieu-khien");
  }
  const query = {};
  if (fileType) query.type = typeMap[fileType];
  if (classMate) query.classes = { has: Number(classMate) };
  const files = await fileModel.findWithFilters(query);
  return Response.json({ files, fileType, classMate });
}

export default function FileLibraryPage() {
  const { files, fileType, classMate } = useLoaderData();
  const pageName = `📁 Lớp ${classMate} / ${viNameMap[fileType]}`;
  return <FileLibraryLayout pageName={pageName} files={files} fileType={fileType} classMate={classMate} accept={acceptMap[fileType]} />;
}
