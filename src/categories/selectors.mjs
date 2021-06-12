import { NotFoundError } from '../errors.mjs';

export function list(state) {
  return Object.values(state.categories);
}

export function byID(state, id) {
  const account = state.categories[id];
  if (!account) {
    throw new NotFoundError(`No account found with id: ${id}`);
  }
  return account;
}
