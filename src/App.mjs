import { v1 as uuidv1 } from "uuid";
import InMemoryPersistence from "./persistence/Memory.mjs";
import FilePersistence from "./persistence/File.mjs";
import { NotFoundError } from "./errors.mjs";
import Account from "./Account.mjs";
import Category from "./Category.mjs";
import Income from "./Income.mjs";
import Expense from "./Expense.mjs";
import Transfer from "./Transfer.mjs";
import Stats from "./Stats.mjs";

function getPersistenceFromOptions({ type, filepath } = {}) {
  switch (type) {
    case "file":
      return new FilePersistence({ filepath });
    default:
      return new InMemoryPersistence();
  }
}

function getTimestamp() {
  return new Date().toISOString();
}

const allReducers = {};
[Account, Category, Income, Expense, Transfer].forEach(({ actions }) => {
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
    expenses: {},
    transfers: {},
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
    persistence.append(augmented);
    reducer(augmented);
  }

  return {
    start: async () => {
      // hydrate state
      await persistence.forEach(reducer);
    },

    // accounts
    createAccount: (data) => {
      const type = "accounts/create";
      const payload = Account.actions[type].payload(data);
      dispatch({ type, payload });
      return state.accounts[payload.id];
    },
    updateAccount: (id, data) => {
      const type = "accounts/update";
      const payload = Account.actions[type].payload(state, id, data);
      if (payload) {
        dispatch({ type, payload });
      }
      return state.accounts[id];
    },
    deleteAccount: (id) => {
      const type = "accounts/delete";
      const payload = Account.actions[type].payload(state, id);
      if (payload) {
        dispatch({ type, payload });
      }
    },
    getAccountByID: (id) => {
      const account = state.accounts[id];
      if (account) {
        return account;
      }
      throw new NotFoundError(`no account with id: ${id}`);
    },
    listAccounts: () => Object.values(state.accounts),

    // categories
    createCategory: (data) => {
      const type = "categories/create";
      const payload = Category.actions[type].payload(data);
      dispatch({ type, payload });
      return state.categories[payload.id];
    },
    updateCategory: (id, data) => {
      const type = "categories/update";
      const payload = Category.actions[type].payload(state, id, data);
      if (payload) {
        dispatch({ type, payload });
      }
      return state.categories[id];
    },
    deleteCategory: (id) => {
      const type = "categories/delete";
      const payload = Category.actions[type].payload(state, id);
      if (payload) {
        dispatch({ type, payload });
      }
    },
    getCategoryByID: (id) => {
      const category = state.categories[id];
      if (category) {
        return category;
      }
      throw new NotFoundError(`no category with id: ${id}`);
    },
    listCategories: () => Object.values(state.categories),

    // income
    listIncome: (query) => Income.selectors.list(state, query),
    createIncome: (data) => {
      const type = "income/create";
      const payload = Income.actions[type].payload(state, data);
      dispatch({ type, payload });
      return state.income[payload.id];
    },
    updateIncome: (id, data) => {
      const type = "income/update";
      const payload = Income.actions[type].payload(state, id, data);
      if (payload) {
        dispatch({ type, payload });
      }
      return state.income[id];
    },
    deleteIncome: (id) => {
      const type = "income/delete";
      const payload = Income.actions[type].payload(state, id);
      if (payload) {
        dispatch({ type, payload });
      }
    },
    getIncomeByID: (id) => {
      const income = state.income[id];
      if (income) {
        return income;
      }
      throw new NotFoundError(`no income with id: ${id}`);
    },

    // expenses
    listExpenses: (query) => Expense.selectors.list(state, query),
    createExpense: (data) => {
      const type = "expenses/create";
      const payload = Expense.actions[type].payload(state, data);
      dispatch({ type, payload });
      return state.expenses[payload.id];
    },
    updateExpense: (id, data) => {
      const type = "expenses/update";
      const payload = Expense.actions[type].payload(state, id, data);
      if (payload) {
        dispatch({ type, payload });
      }
      return state.expenses[id];
    },
    deleteExpense: (id) => {
      const type = "expenses/delete";
      const payload = Expense.actions[type].payload(state, id);
      if (payload) {
        dispatch({ type, payload });
      }
    },
    getExpenseByID: (id) => {
      const expense = state.expenses[id];
      if (expense) {
        return expense;
      }
      throw new NotFoundError(`no expense with id: ${id}`);
    },

    // transfers
    listTransfers: (query) => Transfer.selectors.list(state, query),
    createTransfer: (data) => {
      const type = "transfers/create";
      const payload = Transfer.actions[type].payload(state, data);
      dispatch({ type, payload });
      return state.transfers[payload.id];
    },
    updateTransfer: (id, data) => {
      const type = "transfers/update";
      const payload = Transfer.actions[type].payload(state, id, data);
      if (payload) {
        dispatch({ type, payload });
      }
      return state.transfers[id];
    },
    deleteTransfer: (id) => {
      const type = "transfers/delete";
      const payload = Transfer.actions[type].payload(state, id);
      if (payload) {
        dispatch({ type, payload });
      }
    },
    getTransferByID: (id) => {
      const transfer = state.transfers[id];
      if (transfer) {
        return transfer;
      }
      throw new NotFoundError(`no transfer with id: ${id}`);
    },

    // stats
    getStats: () => Stats.selectors.get(state),
  };
}
