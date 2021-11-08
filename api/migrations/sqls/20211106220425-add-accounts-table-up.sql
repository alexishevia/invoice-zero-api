CREATE TABLE "accounts" (
  id UUID NOT NULL,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0),
  "initialBalance" BIGINT NOT NULL DEFAULT 0
);

COMMENT ON TABLE accounts IS 'Accounts are the building block for IZ. All money in IZ is kept in accounts.';
COMMENT ON COLUMN accounts.id IS 'Unique identifier for the account.';
COMMENT ON COLUMN accounts.name IS 'Human-friendly name for the account.';
COMMENT ON COLUMN accounts."initialBalance" IS 'Amount of money (cents) in the account before tracking transactions in IZ.';
