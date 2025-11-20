import React from "react";
import { redirect } from "react-router";
import { DocumentModel } from "../../.server/document.repo";
import { CategoryModel } from "../../.server/category.repo";
import { requireAuth } from "../../service/auth.server";
import { requireUpdatePermission } from "../../service/authorization.server";
import DocumentEditorComponent from "../../components/DocumentEditorComponent/DocumentEditorComponent";

/**
 * Loader cho route document editor (edit mode)
 */
export async function loader({ request, params }) {
  // Require authentication
  const user = await requireAuth(request);

  const { documentId } = params;

  if (!documentId) {
    throw redirect("/bang-dieu-khien");
  }

  const documentModel = new DocumentModel();
  const document = await documentModel.findById(documentId);

  if (!document) {
    throw new Response("Không tìm thấy tài liệu", { status: 404 });
  }

  // Check permission: ADMIN/MANAGER edit tất cả, TEACHER chỉ edit của mình
  try {
    requireUpdatePermission(user, document);
  } catch (error) {
    // Redirect về dashboard nếu không có quyền
    throw redirect("/bang-dieu-khien");
  }

  const categoryModel = new CategoryModel();
  const category = await categoryModel.findById(document.categoryId);

  return { document, category };
}

/**
 * Component route - chỉ cần pass props từ loader vào DocumentEditorComponent
 */
export default function DocumentEditor({ loaderData }) {
  const { document, category } = loaderData;

  return (
    <DocumentEditorComponent
      document={document}
      isEdit={true}
      apiEndpoint="/api/document"
      redirectPath={`/bang-dieu-khien/thong-tin-suu-tam/${category?.slug}`}
      categoryId={category?.id}
    />
  );
}