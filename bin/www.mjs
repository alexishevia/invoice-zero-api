#!/usr/bin/env node

import RestServer from '../src/RestServer.mjs';

const port = 8080;

const server = new RestServer();
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
