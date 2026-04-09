import cloudinary from '../../common/utils/cloudinary';
import Book from './book.model';

/**
 * List all documents from Cloudinary
 */
const queryCloudinaryDocuments = async (options: any) => {
  const { limit = 10, next_cursor } = options;
  
  // Use Cloudinary Search API or Admin API
  // Search API is better for folders
  const result = await cloudinary.search
    .expression('folder:digital-library/*')
    .sort_by('created_at', 'desc')
    .max_results(limit)
    .next_cursor(next_cursor)
    .execute();

  return {
    results: result.resources.map((res: any) => ({
      publicId: res.public_id,
      fileUrl: res.secure_url,
      fileType: res.format,
      fileSize: res.bytes,
      createdAt: res.created_at,
    })),
    next_cursor: result.next_cursor,
    totalResults: result.total_count,
  };
};

/**
 * Delete document from Cloudinary directly
 */
const deleteCloudinaryDocument = async (publicId: string) => {
  // 1. Delete from Cloudinary
  const result = await cloudinary.uploader.destroy(publicId);

  // 2. Clear document fields in any books referencing this publicId
  await Book.updateMany(
    { documentPublicId: publicId },
    { $unset: { documentUrl: "", documentPublicId: "" } }
  );

  return result;
};

export default {
  queryCloudinaryDocuments,
  deleteCloudinaryDocument,
};
