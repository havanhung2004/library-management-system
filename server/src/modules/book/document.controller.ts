import { Request, Response } from "express";
import { catchAsync } from "../../common/utils/catchAsync";
import documentService from "./document.service";

const getDocuments = catchAsync(async (req: Request, res: Response) => {
  const options = {
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    next_cursor: req.query.next_cursor,
  };
  const result = await documentService.queryCloudinaryDocuments(options);
  res.send({
    success: true,
    data: result.results,
    meta: {
      next_cursor: result.next_cursor,
      totalResults: result.totalResults,
    },
  });
});

const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  const publicId = req.params.documentId;
  await documentService.deleteCloudinaryDocument(publicId);
  res.send({
    success: true,
    message: "Document deleted from Cloudinary successfully",
  });
});

export default {
  getDocuments,
  deleteDocument,
};
