import FileLibraryLayout from "../components/common/FileLibraryLayout.jsx";
import { DocumentModel } from "../.server/document.repo.js";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const userName = url.searchParams.get("userName") || "";

  const documentModel = new DocumentModel();
  const files = await fileModel.findAll();

  return {
    files: {
      files,
      total: files.length,
      page: 1,
      limit: 20,
      totalPages: Math.ceil(files.length / 20),
      hasNextPage: files.length > 20,
      hasPreviousPage: false,
      startIndex: 0,
      endIndex: Math.min(20, files.length),
    },
    userName
  };
};

export default function SearchDocument({ loaderData }) {
  const { files, userName } = loaderData;
  const pageName = `🔎 Tìm kiếm nâng cao`;

  return (
    <FileLibraryLayout
      files={files}
      fileType={"custom"}
      accept={"*/*"}
      pageName={pageName}
      extraData={{
        userName
      }}
    />
  );
}
