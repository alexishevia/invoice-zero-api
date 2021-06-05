import request from 'supertest';
import { expect } from 'chai';
import RestServer from '../../src/RestServer.mjs';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/; // '2021-06-05T19:58:37.863Z'

describe('createAccount', function() {
  [
    {
      name: 'happy path',
      requestBody: { name: 'Groceries', initialBalance: 500.0 },
      expect: {
        statusCode: 201,
        body: {
          'returns a valid id': function (body) {
            expect(typeof body.id).to.equal('string')
            expect(body.id.length).to.be.above(0);
          },
          'returns correct initialBalance': function (body) {
            expect(body.initialBalance).to.equal(500.0);
          },
          'returns correct name': function (body) {
            expect(body.name).to.equal('Groceries');
          },
          'returns a valid modifiedAt': function(body) {
            expect(body.modifiedAt).to.match(isoDateRegex);
          },
        }
      }
    },
    {
      name: 'missing name',
      requestBody: { initialBalance: 500.0 },
      expect: {
        statusCode: 400,
        body: {
          'has correct error message': function(body) {
            expect(body.error).to.include('name');
          }
        }
      },
    },
    {
      name: 'invalid name',
      requestBody: { name: 123, initialBalance: 500.0 },
      expect: {
        statusCode: 400,
        body: {
          'has correct error message': function(body) {
            expect(body.error).to.include('name');
          }
        }
      },
    },
    {
      name: 'missing initialBalance',
      requestBody: { name: 'Groceries' },
      expect: {
        statusCode: 400,
        body: {
          'has correct error message': function(body) {
            expect(body.error).to.include('initialBalance');
          }
        }
      },
    },
    {
      name: 'invalid initialBalance',
      requestBody: { name: 'Groceries', initialBalance: '400.00' },
      expect: {
        statusCode: 400,
        body: {
          'has correct error message': function(body) {
            expect(body.error).to.include('initialBalance');
          }
        }
      },
    },
  ].forEach(function (test) {
    describe(test.name, function() {
      let statusCode;
      let body;

      beforeEach(async function() {
        const server = new RestServer();
        const res = await request(server)
          .post('/accounts')
          .set('Accept', 'application/json')
          .send(test.requestBody);

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
