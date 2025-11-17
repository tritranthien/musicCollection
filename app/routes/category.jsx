import { useLoaderData } from "react-router";
import { CategoryModel } from "../.server/category.repo.js";
import { FileModel } from "../.server/fileUpload.repo.js";
import FileLibraryLayout from "../components/common/FileLibraryLayout.jsx";

const fileModel = new FileModel();
export async function loader({ params }) {
  let fileType = 'custom';
  const category = params.category;
  const categoryModel = new CategoryModel();
  const cate = await categoryModel.findBySlug(category);
  const query = { category: cate.id };
  const files = await fileModel.findWithFilters(query);
  return Response.json({ files, fileType, category: cate.id, cateName: cate.name });
}

export default function FileLibraryPage() {
  const { files, fileType, category, cateName } = useLoaderData();
  let pageName = `📁 ${cateName}`;
  return <FileLibraryLayout files={files} fileType={fileType} category={category} pageName={pageName} />;
}
