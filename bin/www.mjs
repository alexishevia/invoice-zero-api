#!/usr/bin/env node

import createServer from "../src/RestServer.mjs";

const {
  PORT,
  PERSISTENCE_TYPE,
  PERSISTENCE_FILEPATH,
  API_USERNAME,
  API_PASSWORD,
} = process.env;

const port = PORT || 8080;
const persistence = {
  type: PERSISTENCE_TYPE || "memory",
  filepath: PERSISTENCE_FILEPATH || "",
};
const authentication = {
  type: "basic",
  username: API_USERNAME,
  password: API_PASSWORD,
};

async function main() {
  const server = await createServer({ persistence, authentication });
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

main();
