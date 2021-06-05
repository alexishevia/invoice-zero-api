import { v1 as uuidv1 } from 'uuid';
import Validation from './Validation.mjs';

/* --- STATE --- */

const accounts = {};

/* --- ACTIONS --- */

function createAccount(accountData) {
  new Validation(accountData, "name").required().string().notEmpty();
  new Validation(accountData, "initialBalance")
    .required()
    .number()
    .biggerOrEqualThan(0);

  return {
    type: 'accounts/create',
    payload: {
      id: uuidv1(),
      name: accountData.name,
      initialBalance: accountData.initialBalance,
      modifiedAt: new Date().toISOString(),
    }
  };
}

const actions = {
  createAccount,
}

/* --- REDUCER --- */

function process(action) {
  console.log(JSON.stringify(action));
  const { type, payload } = action;
  switch(type) {
    case 'accounts/create':
      accounts[payload.id] = payload
      break;
    default:
      throw new Error(`unknown action.type: ${type}`);
  }
}

/* --- SELECTORS --- */

function listAccounts() {
  return Object.values(accounts);
}

const selectors = {
  listAccounts,
}

/* --- EXPORT --- */

export {
  actions,
  selectors,
  process,
};
