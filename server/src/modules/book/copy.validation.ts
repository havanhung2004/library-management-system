import Joi from "joi";

const createCopy = {
  params: Joi.object().keys({
    bookId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"bookId" must be a valid mongo id',
          });
        }
        return value;
      }),
  }),
  body: Joi.object().keys({
    barcode: Joi.string().required().trim(),
    location: Joi.string().allow("", null).trim(),
    status: Joi.string().valid("available", "borrowed", "lost", "damaged"),
  }),
};

const getCopies = {
  params: Joi.object().keys({
    bookId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"bookId" must be a valid mongo id',
          });
        }
        return value;
      }),
  }),
};

const updateCopy = {
  params: Joi.object().keys({
    bookId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"bookId" must be a valid mongo id',
          });
        }
        return value;
      }),

    copyId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"copyId" must be a valid mongo id',
          });
        }
        return value;
      }),
  }),
  body: Joi.object()
    .keys({
      barcode: Joi.string().trim(),
      location: Joi.string().allow("", null).trim(),
      status: Joi.string().valid("available", "borrowed", "lost", "damaged"),
    })
    .min(1),
};

const deleteCopy = {
  params: Joi.object().keys({
    copyId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message({
            custom: '"copyId" must be a valid mongo id',
          });
        }
        return value;
      }),
  }),
};
export default {
  createCopy,
  getCopies,
  updateCopy,
  deleteCopy,
};
