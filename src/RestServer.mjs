import express from 'express';
import App from './App.mjs';
import {
  NotFoundError,
  InvalidRequestError,
  ConflictError
} from './errors.mjs';

export default async function RestServer({ persistence = {} } = {}) {
  const app = await App({ persistence });
  const server = express();

  server.use(express.json()) // parse serverlication/json

  server.route('/accounts')
    .get((_, res, next) => {
      try {
        res.status(200).json(app.selectors.listAccounts());
      } catch(err) {
        next(err);
      }
    })
    .post((req, res, next) => {
      try {
        const account = app.actions.createAccount(req.body);
        res.status(201).json(account);
      } catch(err) {
        next(err);
      }
    });

  server.route('/accounts/:id')
    .get((req, res, next) => {
      try {
        res.status(200).json(app.selectors.getAccountByID(req.params.id));
      } catch(err) {
        next(err);
      }
    })
    .patch((req, res, next) => {
      try {
        res.status(200).json(app.actions.updateAccount(req.params.id, req.body));
      } catch (err) {
        next(err);
      }
    })
    .delete((req, res, next) => {
      try {
        res.status(200).json(app.actions.deleteAccount(req.params.id));
      } catch (err) {
        next(err);
      }
    });

  server.use(function (_, res) {
    if (!res.headersSent) {
      res.status(404).json({ error: 'route not found' });
    }
  });

  server.use(function (err, _0, res, _1) {
    if (err instanceof InvalidRequestError) {
      res.status(400).json({ name: err.name, error: err.message });
      return;
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ name: err.name, error: err.message });
      return;
    }
    if (err instanceof ConflictError) {
      res.status(409).json({ name: err.name, error: err.message });
      return;
    }
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' });

    // app is in unstable state, shut down server
    process.exit(1);
  })

  return server;
}
