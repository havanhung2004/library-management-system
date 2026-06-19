import Joi from "joi";

const borrowBook = {
  body: Joi.object()
    .keys({
      copyId: Joi.string().custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"copyId" must be a valid mongo id',
          });
        }
        return value;
      }),

      bookId: Joi.string().custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"bookId" must be a valid mongo id',
          });
        }
        return value;
      }),

      loanType: Joi.string().valid("ebook", "physical").optional(), // 👈 THÊM DÒNG NÀY

      durationDays: Joi.number().integer().min(1).max(30).default(14),
    })
    .or("copyId", "bookId"),
};

const returnBook = {
  params: Joi.object().keys({
    loanId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"loanId" must be a valid mongo id',
          });
        }
        return value;
      }),
  }),
};

export default {
  borrowBook,
  returnBook,
};
