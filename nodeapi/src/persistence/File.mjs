import fs from "fs";
import split2 from "split2";

/*
 * FilePersistence
 * appends events to an [ndjson](http://ndjson.org/) file.
 */

export default function FilePersistence({ filepath }) {
  return {
    append: (event) =>
      fs.appendFileSync(filepath, `\n${JSON.stringify(event)}`),
    forEach: async (func) =>
      new Promise((resolve, reject) => {
        try {
          fs.createReadStream(filepath)
            .pipe(split2())
            .on("data", (line) => {
              if (line === "") {
                return;
              }
              func(JSON.parse(line));
            })
            .on("end", resolve)
            .on("error", reject);
        } catch (err) {
          reject(err);
        }
      }),
  };
}
