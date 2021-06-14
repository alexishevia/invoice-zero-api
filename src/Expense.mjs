import { v1 as uuidv1 } from "uuid";
import validate from "./validate.mjs";
import { InvalidRequestError, NotFoundError } from "./errors.mjs";

const parse = {
  amount: (_, val) => {
    validate(val).integer().biggerThan(0);
    return val;
  },
  accountID: (state, val) => {
    const account = state.accounts[val];
    if (!account) {
      throw new Error(`no account with id: ${val}`);
    }
    return val;
  },
  categoryID: (state, val) => {
    const category = state.categories[val];
    if (!category) {
      throw new Error(`no category with id: ${val}`);
    }
    return val;
  },
  description: (_, val) => {
    validate(val).string();
    return val;
  },
  transactionDate: (_, val) => {
    validate(val).dayString();
    return val;
  },
};

function getNewFields(state, data) {
  const required = [
    "amount",
    "accountID",
    "categoryID",
    "transactionDate",
  ].reduce((memo, key) => {
    try {
      memo[key] = parse[key](state, data[key]);
    } catch (err) {
      throw new InvalidRequestError(`${key}: ${err.message}`);
    }
    return memo;
  }, {});
  const optional = ["description"].reduce((memo, key) => {
    if (Object.hasOwnProperty.call(data, key)) {
      try {
        memo[key] = parse[key](state, data[key]);
      } catch (err) {
        throw new InvalidRequestError(`${key}: ${err.message}`);
      }
    }
    return memo;
  }, {});
  return { id: uuidv1(), ...required, ...optional };
}

function getModifiedFields(original, state, data) {
  const allowedFields = new Set([
    "amount",
    "accountID",
    "categoryID",
    "transactionDate",
    "description",
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
    "expenses/create": {
      payload: (state, data) => getNewFields(state, data),
      reducer: ({ state, payload }) => {
        state.expenses[payload.id] = payload;
      },
    },
    "expenses/update": {
      payload: (state, id, data) => {
        const original = state.expenses[id];
        if (!original) {
          throw new NotFoundError(`no expense with id: ${id}`);
        }
        const modified = getModifiedFields(original, state, data);
        if (Object.keys(modified).length === 0) {
          return null;
        } // nothing to dispatch
        return { id, ...modified };
      },
      reducer: ({ state, payload }) => {
        const expense = state.expenses[payload.id];
        Object.entries(payload).forEach(([key, val]) => {
          expense[key] = val;
        });
      },
    },
    "expenses/delete": {
      payload: (state, id) => {
        const original = state.expenses[id];
        if (!original) {
          throw new NotFoundError(`no expense with id: ${id}`);
        }
        return { id };
      },
      reducer: ({ state, payload }) => {
        delete state.expenses[payload.id];
      },
    },
  },
  selectors: {
    list: (state, query = {}) => {
      const { fromDate, toDate, accountIDs, categoryIDs } = query;

      if (categoryIDs && categoryIDs.size === 0) {
        return [];
      }
      if (accountIDs && accountIDs.size === 0) {
        return [];
      }

      const fromDateFilter = ({ transactionDate }) =>
        !fromDate || transactionDate >= fromDate;

      const toDateFilter = ({ transactionDate }) =>
        !toDate || transactionDate <= toDate;

      const accountFilter = ({ accountID }) =>
        !accountIDs || accountIDs.has(accountID);

      const categoryFilter = ({ categoryID }) =>
        !categoryIDs || categoryIDs.has(categoryID);

      return Object.values(state.expenses).filter(
        (transfer) =>
          fromDateFilter(transfer) &&
          toDateFilter(transfer) &&
          accountFilter(transfer) &&
          categoryFilter(transfer)
      );
    },
  },
};
