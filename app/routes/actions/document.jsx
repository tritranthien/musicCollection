// api/document.js
import { DocumentModel } from '../../.server/document.repo';
import { requireAuth } from '../../service/auth.server';
import {
  requireCreatePermission,
  requireUpdatePermission,
  requireDeletePermission,
} from '../../service/authorization.server';

export async function action({ request }) {
  const documentModel = new DocumentModel();

  try {
    // Require authentication
    const user = await requireAuth(request);

    const formData = await request.formData();
    const intent = formData.get('intent');

    switch (intent) {
      case 'create': {
        // Check permission: STUDENT không được tạo
        requireCreatePermission(user);

        const data = {
          title: formData.get('title'),
          description: formData.get('description'),
          content: formData.get('content'),
          categoryId: formData.get('categoryId') || null,
          classes: formData.get('classes') ? JSON.parse(formData.get('classes')) : [],
          ownerId: user.id,
          ownerName: user.name
        };

        // Validation
        if (!data.title || !data.content) {
          return Response.json({
            error: 'Title and content are required'
          }, { status: 400 });
        }

        const document = await documentModel.create(data);

        return Response.json({
          success: true,
          document,
          message: 'Document created successfully'
        });
      }

      case 'update': {
        const documentId = formData.get('documentId');

        if (!documentId) {
          return Response.json({
            error: 'Document ID is required'
          }, { status: 400 });
        }

        // Get existing document
        const existingDocument = await documentModel.findById(documentId);

        if (!existingDocument) {
          return Response.json({
            error: 'Document not found'
          }, { status: 404 });
        }

        // Check permission: ADMIN/MANAGER update tất cả, TEACHER chỉ update của mình
        requireUpdatePermission(user, existingDocument);

        const data = {
          title: formData.get('title'),
          description: formData.get('description'),
          content: formData.get('content'),
          categoryId: formData.get('categoryId') || null,
          classes: formData.get('classes') ? JSON.parse(formData.get('classes')) : []
        };

        const document = await documentModel.update(documentId, data);

        return Response.json({
          success: true,
          document,
          message: 'Document updated successfully'
        });
      }

      case 'delete': {
        const documentId = formData.get('documentId');

        if (!documentId) {
          return Response.json({
            error: 'Document ID is required'
          }, { status: 400 });
        }

        // Get existing document
        const document = await documentModel.findById(documentId);

        if (!document) {
          return Response.json({
            error: 'Document not found'
          }, { status: 404 });
        }

        // Check permission: ADMIN/MANAGER delete tất cả, TEACHER chỉ delete của mình
        requireDeletePermission(user, document);

        await documentModel.delete(documentId);

        return Response.json({
          success: true,
          message: 'Document deleted successfully'
        });
      }

      default:
        return Response.json({
          error: 'Invalid intent'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Document API error:', error);

    // Handle authorization errors
    if (error instanceof Response) {
      throw error;
    }

    return Response.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}