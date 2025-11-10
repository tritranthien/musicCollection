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
    "bai-giang": "lectures",
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
  const files = await fileModel.findAll(query);
  return Response.json({ files, fileType });
}

export default function FileLibraryPage() {
  const { files, fileType } = useLoaderData();
  return <FileLibraryLayout files={files} fileType={fileType} accept={acceptMap[fileType]} />;
}
