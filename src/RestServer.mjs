import express from 'express';
import App from './App.mjs';
import { NotFoundError, InvalidRequestError, ConflictError } from './errors.mjs';

function jsonRoute(statusCode, func) {
  return function(req, res, next) {
    try {
      res.status(statusCode).json(func(req));
    } catch(err) {
      next(err);
    }
  }
}

export default async function RestServer({ persistence = {} } = {}) {
  const { actions, selectors } = await App({ persistence });
  const server = express();

  server.use(express.json()) // parse application/json

  server.route('/accounts')
    .get(jsonRoute(200, () => selectors.listAccounts()))
    .post(jsonRoute(201, req => actions.createAccount(req.body)));

  server.route('/accounts/:id')
    .get(jsonRoute(200, req => selectors.getAccountByID(req.params.id)))
    .patch(jsonRoute(200, req => (
      actions.updateAccount(req.params.id, req.body)
    )))
    .delete(jsonRoute(200, req => actions.deleteAccount(req.params.id)));

  // server.route('/categories')
  //   .get(jsonRoute(200, () => selectors.listCategories()))
  //   .post(jsonRoute(201, (req) => actions.createCategory(req.body)))

  server.use(function (_, res) {
    if (!res.headersSent) {
      res.status(404).json({ error: 'route not found' });
    }
  });

  server.use(function (err, _0, res, _1) {
    if (err instanceof InvalidRequestError) {
      const { name, message } = err;
      res.status(400).json({ error: { name, message } });
      return;
    }
    if (err instanceof NotFoundError) {
      const { name, message } = err;
      res.status(404).json({ error: { name, message } });
      return;
    }
    if (err instanceof ConflictError) {
      const { name, message } = err;
      res.status(409).json({ error: { name, message } });
      return;
    }
    console.error(err.stack)
    res.status(500).json({ error: {
      name: 'InternalServerError',
      message: 'Internal Server Error',
    }});

    // app is in unstable state, shut down server
    process.exit(1);
  })

  return server;
}
