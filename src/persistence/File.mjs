import fs from 'fs';
import split2 from 'split2';

/*
 * FilePersistence
 * appends actions to an [ndjson](http://ndjson.org/) file.
 */

export default function FilePersistence({ filepath }) {
  return {
    appendAction: (action) => {
      return fs.appendFileSync(filepath, '\n'+JSON.stringify(action));
    },
    forEachAction: async (func) => new Promise((resolve, reject) => {
      try {
        fs.createReadStream(filepath)
          .pipe(split2())
          .on('data', (line) => {
            if (line === "") {
              return;
            }
            func(JSON.parse(line));
          })
          .on('end', resolve)
          .on('error', reject)
      } catch(err) {
        reject(err);
      }
    }),
  }
}
