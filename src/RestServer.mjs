import express from 'express';
import App, { NotFoundError, InvalidRequestError } from './App.mjs';

export default function RestServer() {
  const app = new App();
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
    .put((req, res, next) => {
      try {
        res.status(200).json(app.actions.updateAccount(req.params.id, req.body));
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
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' });
  })

  return server;
}
