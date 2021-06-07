import { FatalError } from './errors.mjs';

export default async function Store({ persistence }) {
  const state = {
    accounts: {},
  };

  let skipPersist = false;

  function dispatch(action) {
    const { type, payload } = action;
    try {
      switch(type) {
        case 'accounts/create':
          state.accounts[payload.id] = payload;
          break;
        case 'accounts/update':
          state.accounts[payload.id] = payload;
          break;
        default:
          throw new Error(`unknown action.type: ${type}`);
      }
      if (skipPersist) {
        return;
      }
      persistence.appendAction(action);
    } catch(err) {
      throw new FatalError(err.message);
    }
  }

  // hydrate store on init
  skipPersist = true;
  await persistence.forEachAction(dispatch);
  skipPersist = false;

  return {
    state,
    dispatch,
  };
}
