import { expect } from "chai";
import resetDB from '../../resetDB.mjs';

describe("createAccount", function () {
  beforeEach(resetDB);

  it("runs", function() {
    expect(1).to.equal(1);
  });
});
