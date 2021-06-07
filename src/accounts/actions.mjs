import { v1 as uuidv1 } from 'uuid';
import Validation, { ValidationError } from '../Validation.mjs';
import { getAccountByID } from './selectors.mjs';
import { InvalidRequestError, ConflictError } from '../errors.mjs';

/* --- ACTIONS --- */

export function createAccount(store, accountData) {
  try {
    new Validation(accountData, "name").required().string().notEmpty();
    new Validation(accountData, "initialBalance")
      .required()
      .number()
      .biggerOrEqualThan(0);
  } catch(err) {
    if (err instanceof ValidationError) {
      throw new InvalidRequestError(err.message);
    }
    throw err;
  }
  const account = {
    id: uuidv1(),
    name: accountData.name,
    initialBalance: accountData.initialBalance,
    deleted: false,
    modifiedAt: new Date().toISOString(),
  };
  store.dispatch({ type: 'accounts/create', payload: account });
  return account;
}

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
