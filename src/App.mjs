import InMemoryPersistence from './persistence/Memory.mjs';
import FilePersistence from './persistence/File.mjs';
import Store from './Store.mjs';

import * as accountsApp from './accounts/app.mjs';
import * as categoriesApp from './categories/app.mjs';

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
  const selectors = {};
  [accountsApp, categoriesApp].forEach((app) => {
    // actions
    Object.entries(app.actions).forEach(([name, func]) => {
      if (actions[name]) {
        throw new Error(`duplicate action ${name}`);
      }
      actions[name] = func.bind(null, store);
    });

    // selectors
    Object.entries(app.selectors).forEach(([name, func]) => {
      if (selectors[name]) {
        throw new Error(`duplicate selector ${name}`);
      }
      selectors[name] = func.bind(null, store.state);
    });
  });

  return {
    actions,
    selectors,
  };

}
