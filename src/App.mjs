import InMemoryPersistence from './persistence/Memory.mjs';
import FilePersistence from './persistence/File.mjs';
import Store from './Store.mjs';
import * as importedSelectors from './selectors/selectors.mjs';
import * as importedActions from './actions/actions.mjs';

function getPersistenceFromOptions({ type, filepath }) {
  switch(type) {
    case 'file':
      return new FilePersistence({ filepath });
    default:
      return new InMemoryPersistence();
  }
}

export default async function App(options = {}) {
  const store = await Store({
    persistence: getPersistenceFromOptions(options.persistence),
  });

  const actions = {};
  Object.entries(importedActions).forEach(([name, func]) => {
    actions[name] = func.bind(null, store);
  });

  const selectors = {};
  Object.entries(importedSelectors).forEach(([name, func]) => {
    selectors[name] = func.bind(null, store.state);
  });

  return {
    actions,
    selectors,
  };

}
