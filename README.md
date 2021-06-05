# Invoice Zero API
Invoice Zero is a personal finance system meant to be simple, and easy to use.

## Getting Started
1. Install [nodeJS](https://nodejs.org/) (v14.17.0 preferred)
2. Run `npm install` to install all dependencies
3. Run `npm start` to start the server on `http://localhost:8080`

## API

### Accounts

Accounts are the building block for IZ. All money in IZ is kept in accounts.

Accounts have the following fields:

| field name     | type          | description                         | example                                |
| -------------- | ------------- | ----------------------------------- | -------------------------------------- |
| id             | string        | Unique identifier for the           | "f3528a13-6683-45eb-b48c-34157c95b9db" |
|                | non empty     | account.                            |                                        |
|                |               |                                     |                                        |
| name           | string        | Human-friendly name for the         | "Savings"                              |
|                | non empty     | account.                            |                                        |
|                |               |                                     |                                        |
| initialBalance | float         | Amount of money in the account      | 300.00                                 |
|                |               | before tracking transactions in IZ. |                                        |
|                |               |                                     |                                        |
| modifiedAt     | string        | Last date the account was           | "2019-10-12T12:25:35.059Z"             |
|                | full ISO 8601 | modified. (create, update, and      |                                        |
|                | date in UTC   | delete count for "modifiedAt")      |                                        |

#### Create Account
```
curl -X POST 'http://localhost:8080/accounts' -d '{"name": "Saving", "initialBalance": 300}'
```

#### List Accounts
```
curl -X GET 'http://localhost:8080/accounts'
```

#### Get Account by ID
```
curl -X GET 'http://localhost:8080/accounts/c47555d0-c641-11eb-a092-f79bd9a98d6e'
```

## Running Tests
- Run all tests: `npm test`
- Run tests in debug mode: `npm run test:debug`
- Run a single test: `npx mocha /path/to/test.mjs`
- Run a single test in debug mode: `npx mocha debug /path/to/test.mjs`

## References
This implementation is heavily inspired by this blog post:
[Doing Without Databases in the 21st Century](https://codeburst.io/doing-without-databases-in-the-21st-century-6e25cf495373)


