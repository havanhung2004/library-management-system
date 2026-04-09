import Joi from 'joi';
import { objectId } from '../../common/utils/custom.validation';

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow('', null),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

export default {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
