import { NotFoundError } from '../errors.mjs';

export function listAccounts(state) {
  return Object.values(state.accounts);
}

export function getAccountByID(state, id) {
  const account = state.accounts[id];
  if (!account) {
    throw new NotFoundError(`No account found with id: ${id}`);
  }
  return account;
}
