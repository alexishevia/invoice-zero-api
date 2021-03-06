import { v1 as uuidv1 } from "uuid";
import validate from "./validate.mjs";
import { InvalidRequestError, NotFoundError } from "./errors.mjs";

const parse = {
  amount: (_, val) => {
    validate(val).integer().biggerThan(0);
    return val;
  },
  fromID: (state, val) => {
    const account = state.accounts[val];
    if (!account) {
      throw new Error(`no account with id: ${val}`);
    }
    return val;
  },
  toID: (state, val) => {
    const account = state.accounts[val];
    if (!account) {
      throw new Error(`no account with id: ${val}`);
    }
    return val;
  },
  transactionDate: (_, val) => {
    validate(val).dayString();
    return val;
  },
};

function getNewFields(state, data) {
  const required = ["amount", "fromID", "toID", "transactionDate"].reduce(
    (memo, key) => {
      try {
        memo[key] = parse[key](state, data[key]);
      } catch (err) {
        throw new InvalidRequestError(`${key}: ${err.message}`);
      }
      return memo;
    },
    {}
  );
  return { id: uuidv1(), ...required };
}

function getModifiedFields(original, state, data) {
  const allowedFields = new Set([
    "amount",
    "fromID",
    "toID",
    "transactionDate",
  ]);
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
      newVal = parse[key](state, data[key]);
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
    "transfers/create": {
      payload: (state, data) => getNewFields(state, data),
      reducer: ({ state, payload }) => {
        state.transfers[payload.id] = payload;
      },
    },
    "transfers/update": {
      payload: (state, id, data) => {
        const original = state.transfers[id];
        if (!original) {
          throw new NotFoundError(`no transfer with id: ${id}`);
        }
        const modified = getModifiedFields(original, state, data);
        if (Object.keys(modified).length === 0) {
          return null;
        } // nothing to dispatch
        return { id, ...modified };
      },
      reducer: ({ state, payload }) => {
        const transfer = state.transfers[payload.id];
        Object.entries(payload).forEach(([key, val]) => {
          transfer[key] = val;
        });
      },
    },
    "transfers/delete": {
      payload: (state, id) => {
        const original = state.transfers[id];
        if (!original) {
          throw new NotFoundError(`no transfer with id: ${id}`);
        }
        return { id };
      },
      reducer: ({ state, payload }) => {
        delete state.transfers[payload.id];
      },
    },
  },
  selectors: {
    list: (state, query = {}) => {
      const { fromDate, toDate, accountIDs } = query;

      const fromDateFilter = ({ transactionDate }) =>
        !fromDate || transactionDate >= fromDate;

      const toDateFilter = ({ transactionDate }) =>
        !toDate || transactionDate <= toDate;

      const accountFilter = ({ fromID, toID }) => {
        if (!accountIDs) {
          return true;
        }
        if (accountIDs.size === 0) {
          return false;
        }
        return accountIDs.has(fromID) || accountIDs.has(toID);
      };

      return Object.values(state.transfers).filter(
        (transfer) =>
          fromDateFilter(transfer) &&
          toDateFilter(transfer) &&
          accountFilter(transfer)
      );
    },
  },
};
