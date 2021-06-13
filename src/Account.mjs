import { v1 as uuidv1 } from "uuid";
import validate from "./validate.mjs";
import { InvalidRequestError, NotFoundError } from "./errors.mjs";

const parse = {
  name: (val) => {
    validate(val).string().notEmpty();
    return val;
  },
  initialBalance: (val) => {
    validate(val).number().biggerOrEqualThan(0);
    return val;
  },
};

function getNewFields(data) {
  const parsed = ["name", "initialBalance"].reduce((memo, key) => {
    try {
      memo[key] = parse[key](data[key]);
    } catch (err) {
      throw new InvalidRequestError(`${key}: ${err.message}`);
    }
    return memo;
  }, {});
  return { id: uuidv1(), ...parsed };
}

function getModifiedFields(original, data) {
  const allowedFields = new Set(["name", "initialBalance"]);
  Object.keys(data).forEach((key) => {
    if (!allowedFields.has(key)) {
      throw new InvalidRequestError(`field is not supported: ${key}`);
    }
  });
  const modified = {};
  for (const key of allowedFields) {
    if (!Object.hasOwnProperty.call(data, key)) {
      continue;
    }
    let newVal;
    try {
      newVal = parse[key](data[key]);
    } catch (err) {
      throw new InvalidRequestError(`${key}: ${err.message}`);
    }
    if (newVal !== original[key]) {
      modified[key] = newVal;
    }
  }
  return modified;
}

export default {
  actions: {
    "accounts/create": {
      payload: (data) => getNewFields(data),
      reducer: ({ state, payload }) => {
        state.accounts[payload.id] = payload;
      },
    },
    "accounts/update": {
      payload: (state, id, data) => {
        const original = state.accounts[id];
        if (!original) {
          throw new NotFoundError(`no account with id: ${id}`);
        }
        const modified = getModifiedFields(original, data);
        if (Object.keys(modified).length === 0) {
          return null;
        } // nothing to dispatch
        return { id, ...modified };
      },
      reducer: ({ state, payload }) => {
        const account = state.accounts[payload.id];
        Object.entries(payload).forEach(([key, val]) => {
          account[key] = val;
        });
      },
    },
    "accounts/delete": {
      payload: (state, id) => {
        const original = state.accounts[id];
        if (!original) {
          throw new NotFoundError(`no account with id: ${id}`);
        }
        return { id };
      },
      reducer: ({ state, payload }) => {
        delete state.accounts[payload.id];
      },
    },
  },
  selectors: {
    accountBalance: (state, id) => {
      const account = state.accounts[id];
      if (!account) {
        throw new NotFoundError(`no account with id: ${id}`);
      }
      let balance = account.initialBalance;
      Object.values(state.income).forEach(({ accountID, amount }) => {
        if (accountID === id) {
          balance += amount;
        }
      });
      Object.values(state.expenses).forEach(({ accountID, amount }) => {
        if (accountID === id) {
          balance -= amount;
        }
      });
      Object.values(state.transfers).forEach(({ fromID, toID, amount }) => {
        if (fromID === id) {
          balance -= amount;
        }
        if (toID === id) {
          balance += amount;
        }
      });
      return { [id]: balance };
    },
  },
};
