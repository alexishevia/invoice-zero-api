import express from "express";
import App from "./App.mjs";
import {
  NotFoundError,
  InvalidRequestError,
  ConflictError,
} from "./errors.mjs";

function jsonRoute(statusCode, func) {
  return function (req, res, next) {
    try {
      res.status(statusCode).json(func(req));
    } catch (err) {
      next(err);
    }
  };
}

function noContentRoute(func) {
  return function (req, res, next) {
    try {
      func(req);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default async function createRestServer({ persistence = {} } = {}) {
  const app = new App({ persistence });
  await app.start();
  const server = express();

  server.use(express.json()); // parse application/json

  server
    .route("/accounts")
    .get(jsonRoute(200, () => app.listAccounts()))
    .post(jsonRoute(201, (req) => app.createAccount(req.body)));

  server
    .route("/accounts/:id")
    .get(jsonRoute(200, (req) => app.getAccountByID(req.params.id)))
    .patch(jsonRoute(200, (req) => app.updateAccount(req.params.id, req.body)))
    .delete(noContentRoute((req) => app.deleteAccount(req.params.id)));

  server
    .route("/categories")
    .get(jsonRoute(200, () => app.listCategories()))
    .post(jsonRoute(201, (req) => app.createCategory(req.body)));

  server
    .route("/categories/:id")
    .get(jsonRoute(200, (req) => app.getCategoryByID(req.params.id)))
    .patch(jsonRoute(200, (req) => app.updateCategory(req.params.id, req.body)))
    .delete(jsonRoute(200, (req) => app.deleteCategory(req.params.id)));

  server
    .route("/income")
    .get(jsonRoute(200, () => app.listIncome()))
    .post(jsonRoute(201, (req) => app.createIncome(req.body)));

  server
    .route("/income/:id")
    .get(jsonRoute(200, (req) => app.getIncomeByID(req.params.id)))
    .patch(jsonRoute(200, (req) => app.updateIncome(req.params.id, req.body)))
    .delete(jsonRoute(200, (req) => app.deleteIncome(req.params.id)));

  server
    .route("/expenses")
    .get(jsonRoute(200, () => app.listExpenses()))
    .post(jsonRoute(201, (req) => app.createExpense(req.body)));

  server
    .route("/expenses/:id")
    .get(jsonRoute(200, (req) => app.getExpenseByID(req.params.id)))
    .patch(jsonRoute(200, (req) => app.updateExpense(req.params.id, req.body)))
    .delete(jsonRoute(200, (req) => app.deleteExpense(req.params.id)));

  server
    .route("/transfers")
    .get(jsonRoute(200, () => app.listTransfers()))
    .post(jsonRoute(201, (req) => app.createTransfer(req.body)));

  server
    .route("/transfers/:id")
    .get(jsonRoute(200, (req) => app.getTransferByID(req.params.id)))
    .patch(jsonRoute(200, (req) => app.updateTransfer(req.params.id, req.body)))
    .delete(jsonRoute(200, (req) => app.deleteTransfer(req.params.id)));

  // 404 handler
  server.use(function (_, res) {
    if (!res.headersSent) {
      res.status(404).json({ error: "route not found" });
    }
  });

  // error handler
  server.use(function (err, _0, res, _1) {
    if (err instanceof SyntaxError) {
      res.status(400).json({
        error: {
          name: "InvalidJSON",
          message: "request body must be valid JSON",
        },
      });
      return;
    }
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
    console.error(err.stack);
    res.status(500).json({
      error: {
        name: "InternalServerError",
        message: "Internal Server Error",
      },
    });

    // app is in unstable state, shut down server
    process.exit(1);
  });

  return server;
}
