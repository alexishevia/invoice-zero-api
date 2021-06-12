import request from 'supertest';
import { expect } from 'chai';
import RestServer from '../../src/RestServer.mjs';

async function createAccount(server, data) {
  const response = await request(server)
    .post('/accounts')
    .set('Accept', 'application/json')
    .send(data)
    .expect(201);
  return response.body;
}

describe('getAccountByID', function() {
  let id;

  beforeEach(function() {
    id = null;
  });

  [
    {
      name: 'when account exists',
      setup: async function(server) {
        const account = await createAccount(server, { name: 'Trips', initialBalance: 100 });
        id = account.id;
      },
      id: () => id,
      expect: {
        statusCode: 200,
        body: {
          'returns account id': function(body) {
            expect(body.id).to.be.a('string');
            expect(body.id).not.to.be.empty;
          },
          'returns account name': function(body) {
            expect(body.name).to.equal('Trips');
          },
          'returns account initialBalance': function(body) {
            expect(body.initialBalance).to.equal(100);
          },
        },
      }
    },
    {
      name: 'when account does not exist',
      setup: async function(server) {
        await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      id: () => 'foo',
      expect: { statusCode: 404, body: {} },
    },
  ].forEach(function (test) {
    describe(test.name, function() {
      let statusCode;
      let body;

      beforeEach(async function() {
        const server = await RestServer();

        if(test.setup) {
          await test.setup(server);
        }

        const res = await request(server)
          .get(`/accounts/${test.id()}`)
          .set('Accept', 'application/json')
          .send();

        statusCode = res.statusCode;
        body = res.body;
      });

      it(`returns status code ${test.expect.statusCode}`, function() {
        expect(statusCode).to.equal(test.expect.statusCode);
      });

      Object.entries(test.expect.body).forEach(function([name, func]) {
        it(name, function() {
          func(body);
        });
      });
    });
  });
});
