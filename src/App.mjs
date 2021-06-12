import InMemoryPersistence from './persistence/Memory.mjs';
import FilePersistence from './persistence/File.mjs';
import Store from './Store.mjs';

import AccountsStore from './accounts/Store.mjs';
import * as accountSelectors from './accounts/selectors.mjs';
import * as accountActions from './accounts/actions.mjs';

import CategoriesStore from './categories/Store.mjs';
import * as categorySelectors from './categories/selectors.mjs';
import * as categoryActions from './categories/actions.mjs';

function getPersistenceFromOptions({ type, filepath } = {}) {
  switch(type) {
    case 'file':
      return new FilePersistence({ filepath });
    default:
      return new InMemoryPersistence();
  }
}

export default function App(options = {}) {
  const store = new Store({
    subStores: [
      new AccountsStore(),
      new CategoriesStore(),
    ],
    persistence: getPersistenceFromOptions(options.persistence),
  });
  const { state } = store;

  return {
    start: async () => {
      await store.start();
    },

    // accounts
    createAccount: (data) => accountActions.create(store, data),
    updateAccount: (id, data) => accountActions.update(store, id, data),
    deleteAccount: (id) => accountActions.destroy(store, id),
    getAccountByID: (id) => accountSelectors.byID(state, id),
    listAccounts: () => accountSelectors.list(state),

    // categories
    createCategory: (data) => categoryActions.create(store, data),
    updateCategory: (id, data) => categoryActions.update(store, id, data),
    deleteCategory: (id) => categoryActions.destroy(store, id),
    getCategoryByID: (id) => categorySelectors.byID(state, id),
    listCategories: () => categorySelectors.list(state),
  };

}
