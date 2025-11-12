// app/routes/api.filter.jsx hoặc trong route

import FileModel from "../../.server/fileUpload.repo";

export async function action({ request }) {
  const formData = await request.formData();
  let dateFrom = formData.get('dateFrom') || null;
  let dateTo = formData.get('dateTo') || null;
  if (dateFrom === 'null' || dateFrom === '') dateFrom = null;
  if (dateTo === 'null' || dateTo === '') dateTo = null;
  // Parse filters
  const filters = {
    search: formData.get('search') || '',
    types: JSON.parse(formData.get('types') || '[]'), // Parse array
    classes: JSON.parse(formData.get('classes') || '[]'),
    dateFrom,
    dateTo,
    owner: formData.get('owner') || '',
    category: formData.get('category') || '',
  };

  const page = parseInt(formData.get('page') || '1');
  const limit = parseInt(formData.get('limit') || '20');

  try {
    const fileModel = new FileModel();
    const result = await fileModel.findWithFilters(filters, page, limit);

    return Response.json({
      ...result,
      success: true,
    });
  } catch (error) {
    console.error('Filter action error:', error);
    return Response.json({
      files: [],
      total: 0,
      error: error.message,
      success: false,
    }, { status: 500 });
  }
}