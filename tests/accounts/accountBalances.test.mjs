import request from "supertest";
import { expect } from "chai";
import createRestServer from "../../src/RestServer.mjs";

async function createAccount(server, data) {
  const response = await request(server)
    .post("/accounts")
    .set("Accept", "application/json")
    .send(data)
    .expect(201);
  return response.body;
}

async function createCategory(server, data) {
  const response = await request(server)
    .post("/categories")
    .set("Accept", "application/json")
    .send(data)
    .expect(201);
  return response.body;
}

async function createIncome(server, data) {
  const response = await request(server)
    .post("/income")
    .set("Accept", "application/json")
    .send(data)
    .expect(201);
  return response.body;
}

async function createExpense(server, data) {
  const response = await request(server)
    .post("/expenses")
    .set("Accept", "application/json")
    .send(data)
    .expect(201);
  return response.body;
}

async function createTransfer(server, data) {
  const response = await request(server)
    .post("/transfers")
    .set("Accept", "application/json")
    .send(data)
    .expect(201);
  return response.body;
}

describe("accountBalances", function () {
  let id;

  [
    {
      name: "matches the initialBalance when no transactions exist",
      setup: async function (server) {
        const account = await createAccount(server, {
          name: "Trips",
          initialBalance: 100,
        });
        id = account.id;
      },
      expect: { statusCode: 200, value: 100 },
    },
    {
      name: "returns initialBalance + transactions",
      setup: async function (server) {
        // starts at $100.00
        const account = await createAccount(server, {
          name: "Mock Account",
          initialBalance: 100,
        });
        const otherAccount = await createAccount(server, {
          name: "Mock Account 2",
          initialBalance: 0,
        });
        const category = await createCategory(server, {
          name: "Mock Category",
        });
        id = account.id;

        // $100.00 + $300.50 income = $400.50
        await createIncome(server, {
          amount: 300.5,
          accountID: account.id,
          categoryID: category.id,
          transactionDate: "2021-06-01",
        });

        // $400.50 - $50.25 expense = $350.25
        await createExpense(server, {
          amount: 50.25,
          accountID: account.id,
          categoryID: category.id,
          transactionDate: "2021-06-02",
        });

        // $350.25 - $100 transfer away = $250.25
        await createTransfer(server, {
          amount: 100,
          fromID: account.id,
          toID: otherAccount.id,
          transactionDate: "2021-06-03",
        });

        // $250.25 + 0.25 transfer back = $250.50
        await createTransfer(server, {
          amount: 0.25,
          fromID: otherAccount.id,
          toID: account.id,
          transactionDate: "2021-06-04",
        });
      },
      expect: { statusCode: 200, value: 250.5 },
    },
    {
      name: "returns 404 for non existing account",
      setup: function () {
        id = "123";
      },
      expect: { statusCode: 404 },
    },
  ].forEach(function (test) {
    it(test.name, async function () {
      const server = await createRestServer();

      if (test.setup) {
        await test.setup(server);
      }

      const res = await request(server)
        .get(`/accountBalance/${id}`)
        .set("Accept", "application/json")
        .send()
        .expect(test.expect.statusCode);

      if (test.expect.value) {
        expect(res.body[id]).to.equal(test.expect.value);
      }
    });
  });
});
