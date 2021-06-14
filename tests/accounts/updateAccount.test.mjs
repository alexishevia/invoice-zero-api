import request from "supertest";
import { expect } from "chai";
import RestServer from "../../src/RestServer.mjs";

async function createAccount(server, data) {
  const response = await request(server)
    .post("/accounts")
    .set("Accept", "application/json")
    .send(data)
    .expect(201);
  return response.body;
}

async function deleteAccount(server, id) {
  const response = await request(server)
    .delete(`/accounts/${id}`)
    .send()
    .expect(204);
  return response.body;
}

describe("updateAccount", function () {
  let original;

  beforeEach(function () {
    original = null;
  });

  [
    {
      name: "update initialBalance",
      setup: async function (server) {
        original = await createAccount(server, {
          name: "Trips",
          initialBalance: 100,
        });
      },
      id: () => original.id,
      requestBody: { initialBalance: 1075 },
      expect: {
        onUpdate: {
          statusCode: 200,
          body: {
            "returns account id": function (body) {
              expect(body.id).to.equal(original.id);
            },
            "returns account name": function (body) {
              expect(body.name).to.equal(original.name);
            },
            "returns updated account initialBalance": function (body) {
              expect(body.initialBalance).to.equal(1075);
            },
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            "change is persisted": function (body) {
              expect(body.initialBalance).to.equal(1075);
            },
          },
        },
      },
    },
    {
      name: "update name",
      setup: async function (server) {
        original = await createAccount(server, {
          name: "Trips",
          initialBalance: 100,
        });
      },
      id: () => original.id,
      requestBody: { name: "New Name" },
      expect: {
        onUpdate: {
          statusCode: 200,
          body: {
            "returns account id": function (body) {
              expect(body.id).to.equal(original.id);
            },
            "returns updated account name": function (body) {
              expect(body.name).to.equal("New Name");
            },
            "returns account initialBalance": function (body) {
              expect(body.initialBalance).to.equal(original.initialBalance);
            },
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            "change is persisted": function (body) {
              expect(body.name).to.equal("New Name");
            },
          },
        },
      },
    },
    {
      name: "update id",
      setup: async function (server) {
        original = await createAccount(server, {
          name: "Trips",
          initialBalance: 100,
        });
      },
      id: () => original.id,
      requestBody: { id: "newID" },
      expect: {
        onUpdate: {
          statusCode: 400,
          body: {
            "has correct error message": function (body) {
              expect(body.error.message).to.include("id");
            },
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            "change is not persisted": function (body) {
              expect(body.id).to.equal(original.id);
            },
          },
        },
      },
    },
    {
      name: "update non-existing account",
      id: () => "foo",
      requestBody: { initialBalance: 1075 },
      expect: {
        onUpdate: { statusCode: 404, body: {} },
        onRefetch: { statusCode: 404, body: {} },
      },
    },
    {
      name: "update deleted account",
      setup: async function (server) {
        original = await createAccount(server, {
          name: "Trips",
          initialBalance: 100,
        });
        await deleteAccount(server, original.id);
      },
      id: () => original.id,
      requestBody: { initialBalance: 1075 },
      expect: {
        onUpdate: { statusCode: 404, body: {} },
        onRefetch: { statusCode: 404, body: {} },
      },
    },
  ].forEach(function (test) {
    let server;

    describe(test.name, function () {
      let statusCode;
      let body;

      beforeEach(async function () {
        server = await RestServer();

        if (test.setup) {
          await test.setup(server);
        }

        // run update
        const res = await request(server)
          .patch(`/accounts/${test.id()}`)
          .set("Accept", "application/json")
          .send(test.requestBody);

        statusCode = res.statusCode;
        body = res.body;
      });

      it(`returns status code ${test.expect.onUpdate.statusCode}`, function () {
        expect(statusCode).to.equal(test.expect.onUpdate.statusCode);
      });

      Object.entries(test.expect.onUpdate.body).forEach(function ([
        name,
        func,
      ]) {
        it(name, function () {
          func(body);
        });
      });

      describe("fetching account again after update", function () {
        beforeEach(async function () {
          const res = await request(server)
            .get(`/accounts/${test.id()}`)
            .set("Accept", "application/json")
            .send();

          statusCode = res.statusCode;
          body = res.body;
        });

        it(`returns status code ${test.expect.onRefetch.statusCode}`, function () {
          expect(statusCode).to.equal(test.expect.onRefetch.statusCode);
        });

        Object.entries(test.expect.onRefetch.body).forEach(function ([
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
