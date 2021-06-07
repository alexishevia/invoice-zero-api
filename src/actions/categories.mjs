import { v1 as uuidv1 } from 'uuid';
import Validation, { ValidationError } from '../Validation.mjs';
import { getCategoryByID } from '../selectors/categories.mjs';
import { InvalidRequestError, ConflictError } from '../errors.mjs';

/* --- ACTIONS --- */

export function createCategory(store, categoryData) {
  try {
    new Validation(categoryData, "name").required().string().notEmpty();
  } catch(err) {
    if (err instanceof ValidationError) {
      throw new InvalidRequestError(err.message);
    }
    throw err;
  }
  const category = {
    id: uuidv1(),
    name: categoryData.name,
    deleted: false,
    modifiedAt: new Date().toISOString(),
  };
  store.dispatch({ type: 'categories/create', payload: category });
  return category;
}

export function updateCategory(store, id, newData) {
  const category = getCategoryByID(store.state, id);
  if (category.deleted) {
    throw new ConflictError(`category '${id}' has been deleted`);
  }
  ['id', 'deleted'].forEach((prop) => {
    if (newData.hasOwnProperty(prop)) {
      throw new InvalidRequestError(`updating field '${prop}' is not allowed`);
    }
  });
  const updated = {
    ...category,
    modifiedAt: new Date().toISOString(),
  };
  let modified = false;
  ['name'].forEach((prop) => {
    if (newData.hasOwnProperty(prop) && updated[prop] !== newData[prop]) {
      modified = true;
      updated[prop] = newData[prop];
    }
  });
  if (!modified) {
    return category;
  }
  store.dispatch({ type: 'categories/update', payload: updated });
  return updated;
}

export function deleteCategory(store, id) {
  const category = getCategoryByID(store.state, id)
  if (category.deleted) {
    return category;
  }
  const updated = {
    ...category,
    deleted: true,
    modifiedAt: new Date().toISOString(),
  };
  store.dispatch({ type: 'categories/delete', payload: updated });
  return updated;
}
