import { v1 as uuidv1 } from 'uuid';
import InMemoryPersistence from './persistence/Memory.mjs';
import FilePersistence from './persistence/File.mjs';
import { NotFoundError } from './errors.mjs';
import * as Account from './Account.mjs';
import * as Category from './Category.mjs';
import * as Income from './Income.mjs';

function getPersistenceFromOptions({ type, filepath } = {}) {
  switch(type) {
    case 'file':
      return new FilePersistence({ filepath });
    default:
      return new InMemoryPersistence();
  }
}

function getTimestamp() {
  return new Date().toISOString();
}

const allReducers = {};
[Account, Category, Income].forEach(({ actions }) => {
  Object.entries(actions).forEach(([type, action]) => {
    if (allReducers[type]) {
      throw new Error(`duplicate reducer for type: ${type}`);
    }
    allReducers[type] = action.reducer;
  });
});

export default function App(options = {}) {
  const persistence = getPersistenceFromOptions(options.persistence);
  const state = {
    accounts: {},
    categories: {},
    income: {},
  };

  function reducer(event) {
    for (const [type, reduce] of Object.entries(allReducers)) {
      if (event.type === type) {
        return reduce({
          state,
          id: event.id,
          payload: event.payload,
          timestamp: event.timestamp,
        });
      }
    }
    throw new Error(`unknown event.type: ${event.type}`);
  }

  function dispatch(event) {
    const augmented = {
      id: uuidv1(),
      timestamp: getTimestamp(),
      type: event.type,
      payload: event.payload,
    };
    persistence.append(augmented)
    reducer(augmented);
  }

  return {
    start: async () => {
      // hydrate state
      await persistence.forEach(reducer);
    },

    // accounts
    createAccount: (data) => {
      const type = 'accounts/create';
      const payload = Account.actions[type].payload(data);
      dispatch({ type, payload });
      return state.accounts[payload.id];
    },
    updateAccount: (id, data) => {
      const type = 'accounts/update';
      const payload = Account.actions[type].payload(state, id, data);
      if (payload) { dispatch({ type, payload }); }
      return state.accounts[id];
    },
    deleteAccount: (id) => {
      const type = 'accounts/delete';
      const payload = Account.actions[type].payload(state, id);
      if (payload) { dispatch({ type, payload }); }
      return;
    },
    getAccountByID: (id) => {
      if (state.accounts[id]) { return state.accounts[id]; }
      throw new NotFoundError(`no account with id: ${id}`);
    },
    listAccounts: () => Object.values(state.accounts),

    // categories
    createCategory: (data) => {
      const type = 'categories/create';
      const payload = Category.actions[type].payload(data);
      dispatch({ type, payload });
      return state.categories[payload.id];
    },
    updateCategory: (id, data) => {
      const type = 'categories/update';
      const payload = Category.actions[type].payload(state, id, data);
      if (payload) { dispatch({ type, payload }); }
      return state.categories[id];
    },
    deleteCategory: (id) => {
      const type = 'categories/delete';
      const payload = Category.actions[type].payload(state, id);
      if (payload) { dispatch({ type, payload }); }
      return;
    },
    getCategoryByID: (id) => {
      if (state.categories[id]) {
        return state.categories[id];
      }
      throw new NotFoundError(`no category with id: ${id}`);
    },
    listCategories: () => Object.values(state.categories),

    // income
    listIncome: () => Object.values(state.income),
    createIncome: (data) => {
      const type = 'income/create';
      const payload = Income.actions[type].payload(state, data);
      dispatch({ type, payload });
      return state.income[payload.id];
    },
    updateIncome: (id, data) => {
      const type = 'income/update';
      const payload = Income.actions[type].payload(state, id, data);
      if (payload) { dispatch({ type, payload }); }
      return state.income[id];
    },
    deleteIncome: (id) => {
      const type = 'income/delete';
      const payload = Income.actions[type].payload(state, id);
      if (payload) { dispatch({ type, payload }); }
      return;
    },
    getIncomeByID: (id) => {
      if (state.income[id]) {
        return state.income[id];
      }
      throw new NotFoundError(`no income with id: ${id}`);
    },
  };

}
