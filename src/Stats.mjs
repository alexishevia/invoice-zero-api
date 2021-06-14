function transactionMonth(transactionDate) {
  return transactionDate.substr(0, 7);
}

function Result(initialBalance) {
  let balance = initialBalance;
  const incomeByMonth = {};
  const expensesByMonth = {};

  return {
    processIncome: ({ amount, transactionDate }) => {
      balance += amount; // increment balance
      // increment incomeByMonth
      const month = transactionMonth(transactionDate);
      incomeByMonth[month] = (incomeByMonth[month] || 0) + amount;
    },
    processExpense: ({ amount, transactionDate }) => {
      balance += amount; // decrease balance
      // increment expensesByMonth
      const month = transactionMonth(transactionDate);
      expensesByMonth[month] = (expensesByMonth[month] || 0) + amount;
    },
    processTransferIn: ({ amount }) => {
      balance += amount;
    },
    processTransferOut: ({ amount }) => {
      balance -= amount;
    },
    toJSON: () => ({
      initialBalance,
      currentBalance: balance,
      income: { byMonth: incomeByMonth },
      expenses: { byMonth: expensesByMonth },
    }),
  };
}

export default {
  selectors: {
    get: (state) => {
      const global = new Result(
        Object.values(state.accounts).reduce(
          (memo, { initialBalance }) => memo + initialBalance,
          0
        )
      );
      const perAccount = {};
      const perCategory = {};

      Object.values(state.income).forEach((income) => {
        const { accountID, categoryID } = income;
        const account = state.accounts[accountID];
        const category = state.categories[categoryID];
        if (!account || !category) {
          return;
        }
        global.processIncome(income);
        perAccount[accountID] =
          perAccount[accountID] || new Result(account.initialBalance);
        perAccount[accountID].processIncome(income);
        perCategory[categoryID] = perCategory[categoryID] || new Result(0);
        perCategory[categoryID].processIncome(income);
      });

      Object.values(state.expenses).forEach((expense) => {
        const { accountID, categoryID } = expense;
        const account = state.accounts[accountID];
        const category = state.categories[categoryID];
        if (!account || !category) {
          return;
        }
        global.processExpense(expense);
        perAccount[accountID] =
          perAccount[accountID] || new Result(account.initialBalance);
        perAccount[accountID].processExpense(expense);
        perCategory[categoryID] = perCategory[categoryID] || new Result(0);
        perCategory[categoryID].processExpense(expense);
      });

      Object.values(state.transfers).forEach((transfer) => {
        const { fromID, toID } = transfer;

        const fromAccount = state.accounts[fromID];
        const toAccount = state.accounts[toID];
        if (!fromAccount || !toAccount) {
          return;
        }

        // transfer out
        perAccount[fromID] =
          perAccount[fromID] || new Result(fromAccount.initialBalance);
        perAccount[fromID].processTransferOut(transfer);

        // transfer in
        perAccount[toID] =
          perAccount[toID] || new Result(toAccount.initialBalance);
        perAccount[toID].processTransferIn(transfer);
      });

      return { global, perAccount, perCategory };
    },
  },
};
