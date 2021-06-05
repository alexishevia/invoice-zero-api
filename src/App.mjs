import { v1 as uuidv1 } from 'uuid';
import Validation, { ValidationError } from './Validation.mjs';

/* --- ERRORS --- */

export class NotFoundError extends Error {
  name = 'NotFoundError'
  constructor(message) {
    super(message)
  }
}

export class InvalidRequestError extends Error {
  name = 'InvalidRequestError'
  constructor(message) {
    super(message)
  }
}

export default function App() {

  /* --- STATE --- */

  const accounts = {};

  /* --- ACTIONS --- */

  function createAccount(accountData) {
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
      modifiedAt: new Date().toISOString(),
    };
    process({ type: 'accounts/create', payload: account });
    return account;
  }

  /* --- REDUCER --- */

  function process(action) {
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

  function getAccountByID(id) {
    const account = accounts[id];
    if (!account) {
      throw new NotFoundError(`No account found with id: ${id}`);
    }
    return account;
  }

  /* --- EXPORT --- */


  return {
    actions: {
      createAccount,
    },
    selectors: {
      listAccounts,
      getAccountByID,
    },
  };

}
