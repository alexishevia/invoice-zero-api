import { writeFile } from 'fs/promises';
import { expect } from 'chai';
import { v1 as uuidv1 } from 'uuid';
import App from "../../src/App.mjs";

describe("file based persistence", () => {
  let filepath;

  beforeEach(async function() {
    filepath = `/tmp/invoice_zero_test_${uuidv1()}`;
    await writeFile(filepath, "");
  });

  it("serializes/deserialiazes correctly", async () => {
    const app = new App({ persistence: { type: 'file', filepath } });
    await app.start();

    const accFreelancing = app.createAccount({
      name: 'Freelancing',
      initialBalance: 0
    });
    const accSavings = app.createAccount({
      name: 'Savings',
      initialBalance: 100
    });

    app.updateAccount(accFreelancing.id, { initialBalance: 50 });

    const newApp = new App({ persistence: { type: 'file', filepath } });
    await newApp.start();
    expect(newApp.listAccounts().length).to.equal(2);

    const newAccFreelancing = newApp.getAccountByID(accFreelancing.id);
    expect(newAccFreelancing.name).to.equal('Freelancing');
    expect(newAccFreelancing.initialBalance).to.equal(50);

    const newAccSavings = newApp.getAccountByID(accSavings.id);
    expect(newAccSavings.name).to.equal('Savings');
    expect(newAccSavings.initialBalance).to.equal(100);
  });
});
