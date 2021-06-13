import { v1 as uuidv1 } from "uuid";
import validate from "./validate.mjs";
import { InvalidRequestError, NotFoundError } from "./errors.mjs";

const parse = {
  name: (val) => {
    validate(val).string().notEmpty();
    return val;
  },
};

function getNewFields(data) {
  const parsed = ["name"].reduce((memo, key) => {
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
  const allowedFields = new Set(["name"]);
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
    "categories/create": {
      payload: (data) => getNewFields(data),
      reducer: ({ state, payload }) => {
        state.categories[payload.id] = payload;
      },
    },
    "categories/update": {
      payload: (state, id, data) => {
        const original = state.categories[id];
        if (!original) {
          throw new NotFoundError(`no category with id: ${id}`);
        }
        const modified = getModifiedFields(original, data);
        if (Object.keys(modified).length === 0) {
          return null;
        } // nothing to dispatch
        return { id, ...modified };
      },
      reducer: ({ state, payload }) => {
        const category = state.categories[payload.id];
        Object.entries(payload).forEach(([key, val]) => {
          category[key] = val;
        });
      },
    },
    "categories/delete": {
      payload: (state, id) => {
        const original = state.categories[id];
        if (!original) {
          throw new NotFoundError(`no category with id: ${id}`);
        }
        return { id };
      },
      reducer: ({ state, payload }) => {
        delete state.categories[payload.id];
      },
    },
  },
};
