import { v1 as uuidv1 } from 'uuid';
import Validation, { ValidationError } from './Validation.mjs';
import InMemoryPersistence from './persistence/Memory.mjs';
import FilePersistence from './persistence/File.mjs';

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

export class ConflictError extends Error {
  name = 'ConflictError'
  constructor(message) {
    super(message)
  }
}

export class FatalError extends Error {
  name = 'FatalError'
  constructor(message) {
    super(message)
  }
}

function getPersistenceFromOptions({ type, filepath }) {
  switch(type) {
    case 'file':
      return new FilePersistence({ filepath });
    default:
      return new InMemoryPersistence();
  }
}

export default async function App(options = {}) {
  const persistenceOpts = options.persistence;

  /* --- PERSISTENCE --- */

  const persistence = getPersistenceFromOptions(persistenceOpts);

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
      deleted: false,
      modifiedAt: new Date().toISOString(),
    };
    process({ type: 'accounts/create', payload: account });
    return account;
  }

  function updateAccount(id, newData) {
    const account = accounts[id];
    if (!account) {
      throw new NotFoundError(`no account with id: ${id}`);
    }
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
    process({ type: 'accounts/update', payload: updated });
    return updated;
  }

  function deleteAccount(id) {
    const account = accounts[id];
    if (!account) {
      throw new NotFoundError(`no account with id: ${id}`);
    }
    if (account.deleted) {
      return account;
    }
    const updated = {
      ...account,
      deleted: true,
      modifiedAt: new Date().toISOString(),
    };
    process({ type: 'accounts/update', payload: updated });
    return updated;
  }

  /* --- REDUCER --- */

  function process(action, options = {}) {
    const { type, payload } = action;
    const { skipPersist } = options;
    try {
      switch(type) {
        case 'accounts/create':
          accounts[payload.id] = payload;
          break;
        case 'accounts/update':
          accounts[payload.id] = payload;
          break;
        default:
          throw new Error(`unknown action.type: ${type}`);
      }
      if (!skipPersist) {
        persistence.appendAction(action);
      }
    } catch(err) {
      throw new FatalError(err.message);
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

  /* --- INIT / CONSTRUCTOR --- */

  await persistence.forEachAction((action) => {
    process(action, { skipPersist: true })
  });

  /* --- EXPORT --- */

  return {
    actions: {
      createAccount,
      updateAccount,
      deleteAccount,
    },
    selectors: {
      listAccounts,
      getAccountByID,
    },
  };

}
