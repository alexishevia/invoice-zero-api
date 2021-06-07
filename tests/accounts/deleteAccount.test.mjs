import request from 'supertest';
import { expect } from 'chai';
import RestServer from '../../src/RestServer.mjs';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/; // '2021-06-05T19:58:37.863Z'

async function createAccount(server, data) {
  const response = await request(server)
    .post('/accounts')
    .set('Accept', 'application/json')
    .send(data)
    .expect(201);
  return response.body;
}

describe('deleteAccount', function() {
  let original;

  beforeEach(function() {
    original = null;
  });

  [
    {
      name: 'successful delete',
      setup: async function(server) {
        original = await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      id: () => original.id,
      expect: {
        onDelete: {
          statusCode: 200,
          body: {
            'returns deleted:true': function(body) {
              expect(body.deleted).to.equal(true);
            },
            'returns account id': function(body) {
              expect(body.id).to.equal(original.id);
            },
            'returns account name': function(body) {
              expect(body.name).to.equal(original.name);
            },
            'returns account initialBalance': function(body) {
              expect(body.initialBalance).to.equal(original.initialBalance);
            },
            'returns modifiedAt': function(body) {
              expect(body.modifiedAt).to.match(isoDateRegex);
            },
          },
        },
        onGetByID: {
          statusCode: 200,
          body: {
            'change is persisted': function(body) {
              expect(body.deleted).to.equal(true);
            }
          },
        },
      }
    },
    {
      name: 'delete non-existing account',
      id: () => 'foo',
      requestBody: { initialBalance: 10.75 },
      expect: {
        onDelete: { statusCode: 404, body: {} },
        onGetByID: { statusCode: 404, body: {} },
      }
    },
  ].forEach(function (test) {
    let server;

    describe(test.name, function() {
      let statusCode;
      let body;

      beforeEach(async function() {
        server = await RestServer();

        if(test.setup) {
          await test.setup(server);
        }

        // run delete
        const res = await request(server)
          .delete(`/accounts/${test.id()}`)
          .set('Accept', 'application/json')
          .send();

        statusCode = res.statusCode;
        body = res.body;
      });

      it(`returns status code ${test.expect.onDelete.statusCode}`, function() {
        expect(statusCode).to.equal(test.expect.onDelete.statusCode);
      });

      Object.entries(test.expect.onDelete.body).forEach(function([name, func]) {
        it(name, function() {
          func(body);
        });
      });

      describe('fetching account again after delete', function() {
        beforeEach(async function() {
          const res = await request(server)
            .get(`/accounts/${test.id()}`)
            .set('Accept', 'application/json')
            .send();

          statusCode = res.statusCode;
          body = res.body;
        });

        it(`returns status code ${test.expect.onGetByID.statusCode}`, function() {
          expect(statusCode).to.equal(test.expect.onGetByID.statusCode);
        });

        Object.entries(test.expect.onGetByID.body).forEach(function([name, func]) {
          it(name, function() {
            func(body);
          });
        });
      });
    });
  });
});


