import { getAccountByID } from './selectors.mjs';
import { InvalidRequestError, ConflictError } from '../errors.mjs';
import { newCreateAction } from '../actions.mjs';
import validate from '../validate.mjs';

/* --- ACTIONS --- */

export const createAccount = newCreateAction({
  type: 'accounts/create',
  requiredFields: {
    name: (val) => validate(val).string().notEmpty(),
    initialBalance: (val) => validate(val).number().biggerOrEqualThan(0),
  },
})

export function updateAccount(store, id, newData) {
  const account = getAccountByID(store.state, id);
  if (account.deleted) {
    throw new ConflictError(`account '${id}' has been deleted`);
  }
  ['id', 'deleted'].forEach((prop) => {
    if (newData.hasOwnProperty(prop)) {
      throw new InvalidRequestError(`updating field '${prop}' is not allowed`);
    }
  });
  const updated = {
    ...account,
    modifiedAt: new Date().toISOString(),
  };
  let modified = false;
  ['name', 'initialBalance'].forEach((prop) => {
    if (newData.hasOwnProperty(prop) && updated[prop] !== newData[prop]) {
      modified = true;
      updated[prop] = newData[prop];
    }
  });
  if (!modified) {
    return account;
  }
  store.dispatch({ type: 'accounts/update', payload: updated });
  return updated;
}

export function deleteAccount(store, id) {
  const account = getAccountByID(store.state, id)
  if (account.deleted) {
    return account;
  }
  const updated = {
    ...account,
    deleted: true,
    modifiedAt: new Date().toISOString(),
  };
  store.dispatch({ type: 'accounts/delete', payload: updated });
  return updated;
}
