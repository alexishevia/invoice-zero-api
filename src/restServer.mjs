import express from 'express';
import {
  actions,
  selectors,
  process,
} from './app.mjs';

export default function RestServer() {
  const app = express();

  app.use(express.json()) // parse application/json

  app.route('/accounts')
    .get((_, res, next) => {
      try {
        res.status(200).json(selectors.listAccounts());
      } catch(err) {
        next(err);
      }
    })
    .post((req, res, next) => {
      try {
        const action = actions.createAccount(req.body);
        process(action);
        res.status(201).json(action.payload);
      } catch(err) {
        next(err);
      }
    });

  app.use(function (_, res) {
    if (!res.headersSent) {
      res.status(404).json({ error: 'route not found' });
    }
  });

  app.use(function (err, _0, res, _1) {
    console.error(err.stack)
    res.status(500).json({ error: err.message });
  })

  return app;
}
