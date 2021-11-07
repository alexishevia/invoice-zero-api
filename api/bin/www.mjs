#!/usr/bin/env node

import massive from 'massive';
import createServer from "../src/RestServer.mjs";

const {
  PORT,
  AUTH_USERNAME,
  AUTH_PASSWORD,
  DATABASE_URL,
} = process.env;

const port = PORT || 8080;
const authentication = {
  type: "basic",
  username: AUTH_USERNAME,
  password: AUTH_PASSWORD,
};

async function main() {
  const db = await massive(DATABASE_URL);
  const server = await createServer({ db, authentication });
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
