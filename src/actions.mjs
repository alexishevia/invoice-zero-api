import { v1 as uuidv1 } from 'uuid';
import { InvalidRequestError, ConflictError } from './errors.mjs';

// "create" actions add objects to the store
export function newCreateAction({ type, requiredFields = {}, optionalFields = {} }) {
  return function(store, data) {
    const payload = {}

    // required fields
    Object.keys(requiredFields).forEach((key) => {
      if (!data.hasOwnProperty(key)) {
        throw new InvalidRequestError(`missing required field: ${key}`);
      }
    });

    // copy fields from request into action payload
    Object.entries(data).forEach(([key, val]) => {
      const validateFunc = requiredFields[key] || optionalFields[key];
      if (!validateFunc) {
        throw new InvalidRequestError(`field is not supported: ${key}`);
      }
      try {
        validateFunc(val);
      } catch(err) {
        throw new InvalidRequestError(`${key}: ${err.message}`);
      }
      payload[key] = val;
    });

    // auto-generated fields
    payload.id = uuidv1();
    payload.deleted = false;
    payload.modifiedAt = new Date().toISOString();

    // dispatch
    store.dispatch({ type, payload });
    return payload;
  }
}

// "update" actions modify data for an existing object
export function newUpdateAction({ type, selector, optionalFields = {} }) {
  return function(store, id, data) {
    const original = selector(store.state, id);
    if (original.deleted) {
      throw new ConflictError(`account '${id}' has been deleted`);
    }

    const payload = {
      ...original,
      modifiedAt: new Date().toISOString(),
    };

    let modified = false;

    // copy fields from request into action payload
    Object.entries(data).forEach(([key, val]) => {
      const validateFunc = optionalFields[key];
      if (!validateFunc) {
        throw new InvalidRequestError(`field is not supported: ${key}`);
      }
      try {
        validateFunc(val);
      } catch(err) {
        throw new InvalidRequestError(`${key}: ${err.message}`);
      }
      if (val !== payload[key]) {
        modified = true;
        payload[key] = val;
      }
    });

    if (!modified) {
      return original;
    }

    // dispatch
    store.dispatch({ type, payload });
    return payload;
  }
}
