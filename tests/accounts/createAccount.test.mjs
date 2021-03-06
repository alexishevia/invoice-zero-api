import request from "supertest";
import { expect } from "chai";
import RestServer from "../../src/RestServer.mjs";

describe("createAccount", function () {
  [
    {
      name: "successful create",
      requestBody: { name: "Groceries", initialBalance: 500 },
      expect: {
        onCreate: {
          statusCode: 201,
          body: {
            "returns a valid id": function (body) {
              expect(typeof body.id).to.equal("string");
              expect(body.id.length).to.be.above(0);
            },
            "returns correct initialBalance": function (body) {
              expect(body.initialBalance).to.equal(500);
            },
            "returns correct name": function (body) {
              expect(body.name).to.equal("Groceries");
            },
          },
        },
        onListAccounts: {
          statusCode: 200,
          body: {
            "persists account": function (body) {
              expect(body.length).to.equal(1);
            },
          },
        },
      },
    },
    {
      name: "missing name",
      requestBody: { initialBalance: 500 },
      expect: {
        onCreate: {
          statusCode: 400,
          body: {
            "has correct error message": function (body) {
              expect(body.error.message).to.include("name");
            },
          },
        },
        onListAccounts: {
          statusCode: 200,
          body: {
            "does not add account": function (body) {
              expect(body.length).to.equal(0);
            },
          },
        },
      },
    },
    {
      name: "invalid name",
      requestBody: { name: 123, initialBalance: 500 },
      expect: {
        onCreate: {
          statusCode: 400,
          body: {
            "has correct error message": function (body) {
              expect(body.error.message).to.include("name");
            },
          },
        },
        onListAccounts: {
          statusCode: 200,
          body: {
            "does not add account": function (body) {
              expect(body.length).to.equal(0);
            },
          },
        },
      },
    },
    {
      name: "missing initialBalance",
      requestBody: { name: "Groceries" },
      expect: {
        onCreate: {
          statusCode: 400,
          body: {
            "has correct error message": function (body) {
              expect(body.error.message).to.include("initialBalance");
            },
          },
        },
        onListAccounts: {
          statusCode: 200,
          body: {
            "does not add account": function (body) {
              expect(body.length).to.equal(0);
            },
          },
        },
      },
    },
    {
      name: "invalid initialBalance",
      requestBody: { name: "Groceries", initialBalance: "5.10" },
      expect: {
        onCreate: {
          statusCode: 400,
          body: {
            "has correct error message": function (body) {
              expect(body.error.message).to.include("initialBalance");
            },
          },
        },
        onListAccounts: {
          statusCode: 200,
          body: {
            "does not add account": function (body) {
              expect(body.length).to.equal(0);
            },
          },
        },
      },
    },
  ].forEach(function (test) {
    describe(test.name, function () {
      let server;
      let statusCode;
      let body;

      beforeEach(async function () {
        server = await RestServer();
        const res = await request(server)
          .post("/accounts")
          .set("Accept", "application/json")
          .send(test.requestBody);

        statusCode = res.statusCode;
        body = res.body;
      });

      it(`returns status code ${test.expect.onCreate.statusCode}`, function () {
        expect(statusCode).to.equal(test.expect.onCreate.statusCode);
      });

      Object.entries(test.expect.onCreate.body).forEach(function ([
        name,
        func,
      ]) {
        it(name, function () {
          func(body);
        });
      });

      describe("fetching listings after create", function () {
        beforeEach(async function () {
          const res = await request(server)
            .get("/accounts")
            .set("Accept", "application/json")
            .send();

          statusCode = res.statusCode;
          body = res.body;
        });

        it(`returns status code ${test.expect.onListAccounts.statusCode}`, function () {
          expect(statusCode).to.equal(test.expect.onListAccounts.statusCode);
        });

        Object.entries(test.expect.onListAccounts.body).forEach(function ([
          name,
          func,
        ]) {
          it(name, function () {
            func(body);
          });
        });
      });
    });
  });
});
