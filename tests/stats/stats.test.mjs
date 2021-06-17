import App from "../../src/App.mjs";
import { expect } from "chai";

describe("stats", () => {
  it("returns reliable data", async () => {
    let stats;

    const app = new App();
    await app.start();

    const accMain = app.createAccount({ name: "Main", initialBalance: 500 });
    const accSavings = app.createAccount({
      name: "Savings",
      initialBalance: 500,
    });
    const accExpenses = app.createAccount({
      name: "Vacation",
      initialBalance: 0,
    });
    const catWork = app.createCategory({ name: "Work" });
    const catGroceries = app.createCategory({ name: "Groceries" });

    // earn $1,000 in main account. Distribute:
    // $800 to expenses account
    // $200 to savings account
    app.createIncome({
      amount: 1000,
      accountID: accMain.id,
      categoryID: catWork.id,
      transactionDate: "2020-06-01",
    });
    app.createTransfer({
      amount: 800,
      fromID: accMain.id,
      toID: accExpenses.id,
      transactionDate: "2020-06-02",
    });
    app.createTransfer({
      amount: 200,
      fromID: accMain.id,
      toID: accSavings.id,
      transactionDate: "2020-06-03",
    });

    // spend $350 from the expenses account
    app.createExpense({
      amount: 350,
      accountID: accExpenses.id,
      categoryID: catGroceries.id,
      transactionDate: "2020-06-04",
    });

    stats = await app.getStats();

    // global stats
    let { initialBalance, currentBalance, income, expenses } =
      stats.global.toJSON();
    expect(initialBalance).to.equal(1000);
    expect(income.byMonth["2020-06"]).to.equal(1000);
    expect(expenses.byMonth["2020-06"]).to.equal(350);
    expect(currentBalance).to.equal(1650);

    // expenses account stats
    ({ initialBalance, currentBalance } =
      stats.perAccount[accExpenses.id].toJSON());
    expect(initialBalance).to.equal(0);
    expect(currentBalance).to.equal(450);

    // savings account stats
    ({ initialBalance, currentBalance } =
      stats.perAccount[accSavings.id].toJSON());
    expect(initialBalance).to.equal(500);
    expect(currentBalance).to.equal(700);

    // main account stats
    ({ initialBalance, currentBalance } =
      stats.perAccount[accMain.id].toJSON());
    expect(initialBalance).to.equal(500);
    expect(currentBalance).to.equal(500);
  });
});
