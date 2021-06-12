import { v1 as uuidv1 } from 'uuid';
import validate from './validate.mjs';
import { InvalidRequestError, NotFoundError } from './errors.mjs';

const parse = {
  amount: (_, val) => {
    validate(val).number().biggerThan(0);
    return val;
  },
  accountID: (state, val) => {
    const account = state.accounts[val];
    if (!account) {
      throw new Error(`no account with id: ${val}`);
    }
    return val
  },
  categoryID: (state, val) => {
    const category = state.categories[val];
    if (!category) {
      throw new Error(`no category with id: ${val}`);
    }
    return val
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
    'amount', 'accountID', 'categoryID', 'transactionDate',
  ].reduce((memo, key) => {
    try {
      memo[key] = parse[key](state, data[key]);
    } catch (err) {
      throw new InvalidRequestError(`${key}: ${err.message}`);
    }
    return memo;
  }, {});
  const optional = [
    'description'
  ].reduce((memo, key) => {
    if (data.hasOwnProperty(key)) {
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
  const allowedFields = new Set(
    ['amount', 'accountID', 'categoryID', 'transactionDate', 'description']
  );
  Object.keys(data).forEach((key) => {
    if (!allowedFields.has(key)) {
      throw new InvalidRequestError(`field is not supported: ${key}`);
    }
  });
  const modified = {};
  for (const key of allowedFields) {
    if (!data.hasOwnProperty(key)) { continue; }
    let newVal;
    try {
      newVal = parse[key](state, data[key]);
    } catch(err) {
      throw new InvalidRequestError(`${key}: ${err.message}`);
    }
    if (newVal !== original[key]) {
      modified[key] = newVal;
    }
  }
  return modified;
}

export const actions = {
  'income/create': {
    payload: (state, data) => getNewFields(state, data),
    reducer: ({ state, payload }) => {
      state.income[payload.id] = payload;
    },
  },
  'income/update': {
    payload: (state, id, data) => {
      const original = state.income[id];
      if (!original) {
        throw new NotFoundError(`no income with id: ${id}`);
      }
      const modified = getModifiedFields(original, state, data);
      if (Object.keys(modified).length == 0) { return null } // nothing to dispatch
      return { id, ...modified };
    },
    reducer: ({ state, payload }) => {
      const income = state.income[payload.id];
      Object.entries(payload).forEach(([key, val]) => {
        income[key] = val;
      });
    },
  },
  'income/delete': {
    payload: (state, id) => {
      const original = state.income[id];
      if (!original) {
        throw new NotFoundError(`no income with id: ${id}`);
      }
      return { id };
    },
    reducer: ({ state, payload }) => {
      delete state.income[payload.id];
    },
  },
};
