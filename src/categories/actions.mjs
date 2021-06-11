import { getCategoryByID } from './selectors.mjs';
import { InvalidRequestError, ConflictError } from '../errors.mjs';
import { newCreateAction } from '../actions.mjs';
import validate from '../validate.mjs';

/* --- ACTIONS --- */

export const createCategory = newCreateAction({
  type: 'categories/create',
  requiredFields: {
    name: (val) => validate(val).string().notEmpty(),
  },
});

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
