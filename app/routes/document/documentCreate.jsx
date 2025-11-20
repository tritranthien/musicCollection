import { redirect } from "react-router";
import { CategoryModel } from "../../.server/category.repo";
import { requireAuth } from "../../service/auth.server";
import { requireCreatePermission } from "../../service/authorization.server";
import DocumentEditorComponent from "../../components/DocumentEditorComponent/DocumentEditorComponent";

export const loader = async ({ request, params }) => {
  // Require authentication
  const user = await requireAuth(request);

  // Check permission: STUDENT không được tạo document
  try {
    requireCreatePermission(user);
  } catch (error) {
    // Redirect về dashboard nếu không có quyền
    throw redirect("/bang-dieu-khien");
  }

  const categoryId = params.categoryId;
  const categoryModel = new CategoryModel();
  const category = await categoryModel.findById(categoryId);

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  return { category };
};

export default function DocumentEditor({ loaderData }) {
  const { category } = loaderData;
  return (
    <DocumentEditorComponent
      document={null}
      isEdit={false}
      apiEndpoint="/api/document"
      redirectPath={`/bang-dieu-khien/thong-tin-suu-tam/${category.slug}`}
      categoryId={category.id}
    />
  );
}