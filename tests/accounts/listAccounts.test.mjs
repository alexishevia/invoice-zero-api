import request from 'supertest';
import { expect } from 'chai';
import RestServer from '../../src/RestServer.mjs';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/; // '2021-06-05T19:58:37.863Z'

function createAccount(server, data) {
  return request(server)
    .post('/accounts')
    .set('Accept', 'application/json')
    .send(data)
    .expect(201);
}

describe('listAccounts', function() {
  [
    {
      name: 'when no accounts exist',
      expect: {
        statusCode: 200,
        body: {
          'returns empty array': function(body) {
            expect(body).to.eql([]);
          }
        }
      },
    },
    {
      name: 'when a single account exists',
      setup: async function(server) {
        await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      expect: {
        statusCode: 200,
        body: {
          'returns array with single account': function(body) {
            expect(body).to.be.a('array');
          },
          'returns account id': function(body) {
            expect(body[0].id).to.be.a('string');
            expect(body[0].id).not.to.be.empty;
          },
          'returns account name': function(body) {
            expect(body[0].name).to.equal('Trips');
          },
          'returns account initialBalance': function(body) {
            expect(body[0].initialBalance).to.equal(100);
          },
          'returns account modifiedAt': function(body) {
            expect(body[0].modifiedAt).to.match(isoDateRegex);
          },
        },
      }
    },
    {
      name: 'when multiple accounts exist',
      setup: async function(server) {
        await Promise.all([
          { name: 'Trips', initialBalance: 100 },
          { name: 'Daily Expenses', initialBalance: 0 },
        ].map(createAccount.bind(null, server)));
      },
      expect: {
        statusCode: 200,
        body: {
          'returns array with all accounts': function(body) {
            expect(body).to.be.a('array');
            expect(body.length).to.equal(2);
          },
        },
      }
    },
  ].forEach(function (test) {
    describe(test.name, function() {
      let statusCode;
      let body;

      beforeEach(async function() {
        const server = new RestServer();

        if(test.setup) {
          await test.setup(server);
        }

        const res = await request(server)
          .get('/accounts')
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
