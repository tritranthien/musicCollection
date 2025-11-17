// api/document.js
import { DocumentModel } from '../../.server/document.repo';
import { requireAuth } from '../../utils/auth';

export async function action({ request }) {
  // Kiểm tra authentication
  const user = await requireAuth(request);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  const documentModel = new DocumentModel();

  try {
    switch (intent) {
      case 'delete': {
        const documentId = formData.get('documentId');
        
        if (!documentId) {
          return {
            error: 'Document ID is required',
            status: 400
          };
        }

        // Kiểm tra quyền sở hữu document
        const document = await documentModel.findById(documentId);
        
        if (!document) {
          return {
            error: 'Document not found',
            status: 404
          };
        }

        // Chỉ cho phép owner hoặc admin xóa
        if (document.ownerId !== user.id && !user.isAdmin) {
          return {
            error: 'Unauthorized to delete this document',
            status: 403
          };
        }

        await documentModel.delete(documentId);

        return {
          success: true,
          message: 'Document deleted successfully'
        };
      }

      case 'create': {
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
          return {
            error: 'Title and content are required',
            status: 400
          };
        }

        const document = await documentModel.create(data);

        return {
          success: true,
          document,
          message: 'Document created successfully'
        };
      }

      case 'update': {
        const documentId = formData.get('documentId');
        
        if (!documentId) {
          return {
            error: 'Document ID is required',
            status: 400
          };
        }

        // Kiểm tra quyền sở hữu
        const existingDocument = await documentModel.findById(documentId);
        
        if (!existingDocument) {
          return {
            error: 'Document not found',
            status: 404
          };
        }

        if (existingDocument.ownerId !== user.id && !user.isAdmin) {
          return {
            error: 'Unauthorized to update this document',
            status: 403
          };
        }

        const data = {
          title: formData.get('title'),
          description: formData.get('description'),
          content: formData.get('content'),
          categoryId: formData.get('categoryId') || null,
          classes: formData.get('classes') ? JSON.parse(formData.get('classes')) : []
        };

        const document = await documentModel.update(documentId, data);

        return {
          success: true,
          document,
          message: 'Document updated successfully'
        };
      }

      default:
        return {
          error: 'Invalid intent',
          status: 400
        };
    }
  } catch (error) {
    console.error('Document API error:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500
    };
  }
}