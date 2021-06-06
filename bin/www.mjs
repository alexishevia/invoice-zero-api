#!/usr/bin/env node

import RestServer from '../src/RestServer.mjs';

const { PORT, PERSISTENCE_TYPE, PERSISTENCE_FILEPATH } = process.env;

const port = PORT || 8080;
const persistence = {
  type: PERSISTENCE_TYPE || 'memory',
  filepath: PERSISTENCE_FILEPATH || '',
};

(async function() {
  const server = await RestServer({ persistence });
  server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });
})();
