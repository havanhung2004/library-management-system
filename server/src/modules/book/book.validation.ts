import Joi from 'joi';

const createBook = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    author: Joi.string().required(),
    isbn: Joi.string().required(),
    category: Joi.string().required().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message({ custom: '"category" must be a valid mongo id' });
      }
      return value;
    }),
    description: Joi.string(),
    coverImage: Joi.string(),
    publisher: Joi.string(),
    publishedYear: Joi.number(),
  }),
};

const getBooks = {
  query: Joi.object().keys({
    title: Joi.string(),
    author: Joi.string(),
    category: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBook = {
  params: Joi.object().keys({
    bookId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message({ custom: '"bookId" must be a valid mongo id' });
      }
      return value;
    }),
  }),
};

export default {
  createBook,
  getBooks,
  getBook,
};
