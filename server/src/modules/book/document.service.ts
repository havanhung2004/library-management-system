import cloudinary from "../../common/utils/cloudinary";
import Book from "./book.model";

/**
 * List all documents from Cloudinary
 */
const queryCloudinaryDocuments = async (options: any) => {
  const { limit = 10, next_cursor } = options;

  const result = await cloudinary.search
    .expression("folder:digital-library/*")
    .sort_by("created_at", "desc")
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
  const result = await cloudinary.uploader.destroy(publicId);

  await Book.updateMany(
    { documentPublicId: publicId },
    { $unset: { documentUrl: "", documentPublicId: "" } },
  );

  return result;
};

export default {
  queryCloudinaryDocuments,
  deleteCloudinaryDocument,
};
