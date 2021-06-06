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

describe('updateAccount', function() {
  let original;

  beforeEach(function() {
    original = null;
  });

  [
    {
      name: 'update initialBalance',
      setup: async function(server) {
        original = await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      id: () => original.id,
      requestBody: { initialBalance: 10.75 },
      expect: {
        onUpdate: {
          statusCode: 200,
          body: {
            'returns account id': function(body) {
              expect(body.id).to.equal(original.id);
            },
            'returns account name': function(body) {
              expect(body.name).to.equal(original.name);
            },
            'returns updated account initialBalance': function(body) {
              expect(body.initialBalance).to.equal(10.75);
            },
            'returns updated modifiedAt': function(body) {
              expect(body.modifiedAt).to.match(isoDateRegex);
              expect(new Date(body.modifiedAt)).to.be.above(new Date(original.modifiedAt));
            },
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            'change is persisted': function(body) {
              expect(body.initialBalance).to.equal(10.75);
            }
          },
        },
      }
    },
    {
      name: 'update name',
      setup: async function(server) {
        original = await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      id: () => original.id,
      requestBody: { name: 'New Name' },
      expect: {
        onUpdate: {
          statusCode: 200,
          body: {
            'returns account id': function(body) {
              expect(body.id).to.equal(original.id);
            },
            'returns updated account name': function(body) {
              expect(body.name).to.equal('New Name');
            },
            'returns account initialBalance': function(body) {
              expect(body.initialBalance).to.equal(original.initialBalance);
            },
            'returns updated modifiedAt': function(body) {
              expect(body.modifiedAt).to.match(isoDateRegex);
              expect(new Date(body.modifiedAt)).to.be.above(new Date(original.modifiedAt));
            },
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            'change is persisted': function(body) {
              expect(body.name).to.equal('New Name');
            }
          },
        },
      }
    },
    {
      name: 'update id',
      setup: async function(server) {
        original = await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      id: () => original.id,
      requestBody: { id: 'newID' },
      expect: {
        onUpdate: {
          statusCode: 200,
          body: {
            'ignores user defined id; keeps original id': function(body) {
              expect(body.id).to.equal(original.id);
            }
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            'change is not persisted': function(body) {
              expect(body.id).to.equal(original.id);
            },
            'modified at is updated': function(body) {
              expect(body.modifiedAt).to.match(isoDateRegex);
              expect(new Date(body.modifiedAt)).to.be.above(new Date(original.modifiedAt));
            },
          },
        },
      }
    },
    {
      name: 'update modifiedAt',
      setup: async function(server) {
        original = await createAccount(server, { name: 'Trips', initialBalance: 100 });
      },
      id: () => original.id,
      requestBody: { modifiedAt: '2020-01-01T00:00:00.000Z' },
      expect: {
        onUpdate: {
          statusCode: 200,
          body: {
            'ignores user defined modifiedAt; generates new modifiedAt': function(body) {
              expect(body.modifiedAt).to.match(isoDateRegex);
              expect(new Date(body.modifiedAt)).to.be.above(new Date(original.modifiedAt));
            }
          },
        },
        onRefetch: {
          statusCode: 200,
          body: {
            'change is persisted': function(body) {
              expect(body.modifiedAt).to.match(isoDateRegex);
              expect(new Date(body.modifiedAt)).to.be.above(new Date(original.modifiedAt));
            }
          },
        },
      }
    },
  ].forEach(function (test) {
    let server;

    describe(test.name, function() {
      let statusCode;
      let body;

      beforeEach(async function() {
        server = new RestServer();

        if(test.setup) {
          await test.setup(server);
        }

        // run update
        const res = await request(server)
          .put(`/accounts/${test.id()}`)
          .set('Accept', 'application/json')
          .send(test.requestBody);

        statusCode = res.statusCode;
        body = res.body;
      });

      it(`returns status code ${test.expect.onUpdate.statusCode}`, function() {
        expect(statusCode).to.equal(test.expect.onUpdate.statusCode);
      });

      Object.entries(test.expect.onUpdate.body).forEach(function([name, func]) {
        it(name, function() {
          func(body);
        });
      });

      describe('fetching account again after update', function() {
        beforeEach(async function() {
          const res = await request(server)
            .get(`/accounts/${test.id()}`)
            .set('Accept', 'application/json')
            .send(test.requestBody);

          statusCode = res.statusCode;
          body = res.body;
        });

        it(`returns status code ${test.expect.onRefetch.statusCode}`, function() {
          expect(statusCode).to.equal(test.expect.onRefetch.statusCode);
        });

        Object.entries(test.expect.onRefetch.body).forEach(function([name, func]) {
          it(name, function() {
            func(body);
          });
        });
      });
    });
  });
});

