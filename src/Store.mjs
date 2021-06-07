import { FatalError } from './errors.mjs';

export default async function Store({ subStores, persistence }) {
  const state = {};
  let skipPersist = false;

  subStores.forEach((store) => {
    if (state[store.name]) {
      throw new Error(`duplicate store name: ${store.name}`);
    }
    state[store.name] = store.state;
  });

  function dispatch(action) {
    try {
      let handled = false;
      subStores.forEach((store) => {
        if (store.dispatch(state, action)) {
          handled = true;
        }
      });
      if (!handled) {
        throw new Error(`unknown action.type: ${action.type}`);
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
