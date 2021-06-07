import { NotFoundError } from '../errors.mjs';

export function listCategories(state) {
  return Object.values(state.categories);
}

export function getCategoryByID(state, id) {
  const account = state.categories[id];
  if (!account) {
    throw new NotFoundError(`No account found with id: ${id}`);
  }
  return account;
}
