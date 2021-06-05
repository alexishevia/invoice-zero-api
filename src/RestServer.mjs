import express from 'express';
import App from './App.mjs';
import { ValidationError } from './Validation.mjs';

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

  server.use(function (_, res) {
    if (!res.headersSent) {
      res.status(404).json({ error: 'route not found' });
    }
  });

  server.use(function (err, _0, res, _1) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' });
  })

  return server;
}
