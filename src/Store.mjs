import { FatalError } from './errors.mjs';

export default function Store({ subStores, persistence }) {
  const state = {};
  let skipPersist = false;

  subStores.forEach((store) => {
    if (state[store.mountPoint]) {
      throw new Error(`duplicate store mountPoint: ${store.mountPoint}`);
    }
    state[store.mountPoint] = store.state;
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

  return {
    start: async () => {
      // hydrate store
      skipPersist = true;
      await persistence.forEachAction(dispatch);
      skipPersist = false;
    },
    state,
    dispatch,
  };
}
