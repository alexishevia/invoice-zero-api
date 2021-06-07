# Invoice Zero API
Invoice Zero is a personal finance system meant to be simple, and easy to use.

1. [Getting Started](#getting-started)
2. [Persistence](#persistence)
3. [API](#api)
	1. [Accounts](#accounts)
		1. [Create Account](#create-account)
		2. [List Accounts](#list-accounts)
		3. [Get Account by ID](#get-account-by-id)
		4. [Update Account](#update-account)
		5. [Delete Account](#delete-account)
	2. [Categories](#categories)
		1. [Create Category](#create-category)
		2. [List Categories](#list-categories)
		3. [Get Category by ID](#get-category-by-id)
		4. [Update Category](#update-category)
		5. [Delete Category](#delete-category)
3. [Running Tests](#running-tests)
4. [Architecture](#architecture)
5. [References](#references)

## Getting Started
1. Install [nodeJS](https://nodejs.org/) (v14.17.0 preferred)
2. Run `npm install` to install all dependencies
3. Run `npm start` to start the server on `http://localhost:8080`

## Persistence
By default, data is only kept in memory. All data will be lost once the server is shut down.

To enable file-based persistence:
1. Create a new file to hold data, eg: `touch /tmp/invoice-zero-api.mdjson`
2. Create a `.env` file in the project root with the following fields:
```
PORT=8080
PERSISTENCE_TYPE="file"
PERSISTENCE_FILEPATH="/tmp/invoice-zero-api.mdjson"
```

## API

### Accounts

Accounts are the building block for IZ. All money in IZ is kept in accounts.

Accounts have the following fields:

```
| field name     | type          | description                    | example                    |
| ---            | ---           | ---                            | ---                        |
| id             | string        | Unique identifier for the      | "f3528a13"                 |
|                | non empty     | account.                       |                            |
|                |               |                                |                            |
| name           | string        | Human-friendly name for the    | "Savings"                  |
|                | non empty     | account.                       |                            |
|                |               |                                |                            |
| initialBalance | float         | Amount of money in the account | 300.00                     |
|                |               | before tracking transactions   |                            |
|                |               | in IZ.                         |                            |
|                |               |                                |                            |
| deleted        | boolean       | true if the account has been   | false                      |
|                |               | deleted. false otherwise.      |                            |
|                |               |                                |                            |
| modifiedAt     | string        | Last date the account was      | "2019-10-12T12:25:35.059Z" |
|                | full ISO 8601 | modified. (create, update, and |                            |
|                | date in UTC   | delete count for "modifiedAt") |                            |
```

#### Create Account
```
curl -X POST 'http://localhost:8080/accounts' \
  --header 'Content-Type: application/json' \
  -d '{"name": "Savings", "initialBalance": 300}'
```

#### List Accounts
```
curl -X GET 'http://localhost:8080/accounts'
```

#### Get Account by ID
```
curl -X GET 'http://localhost:8080/accounts/c47555d0-c641-11eb-a092-f79bd9a98d6e'
```

#### Update Account
```
curl -X PATCH 'http://localhost:8080/accounts/c47555d0-c641-11eb-a092-f79bd9a98d6e' \
  --header 'Content-Type: application/json' \
  -d '{ "name": "New Name" }'
```

#### Delete Account
```
curl -X DELETE 'http://localhost:8080/accounts/c47555d0-c641-11eb-a092-f79bd9a98d6e'
```

### Categories

Categories allow grouping transactions, for reporting purposes.

Categories have the following fields:

```
| field name | type          | description                           | example                    |
| ---        | ---           | ---                                   | ---                        |
| id         | string        | Unique identifier for the category.   | "f3528a13"                 |
|            | non empty     |                                       |                            |
|            |               |                                       |                            |
| name       | string        | Human-friendly name for the category. | "Groceries"                |
|            | non empty     |                                       |                            |
|            |               |                                       |                            |
| modifiedAt | string        | Last date the category was modified.  | "2019-10-12T12:25:35.059Z" |
|            | full ISO 8601 | (create, update, and delete count     |                            |
|            | date in UTC   | for "modifiedAt")                     |                            |
|            |               |                                       |                            |
| deleted    | boolean       | true if the category has been         | false                      |
|            |               | deleted. false otherwise.             |                            |
```

#### Create Category
```
curl -X POST 'http://localhost:8080/categories' \
  --header 'Content-Type: application/json' \
  -d '{"name": "Groceries" }'
```

#### List Categories
```
curl -X GET 'http://localhost:8080/categories'
```

#### Get Category by ID
```
curl -X GET 'http://localhost:8080/categories/c47555d0-c641-11eb-a092-f79bd9a98d6e'
```

#### Update Category
```
curl -X PATCH 'http://localhost:8080/categories/c47555d0-c641-11eb-a092-f79bd9a98d6e' \
  --header 'Content-Type: application/json' \
  -d '{ "name": "New Name" }'
```

#### Delete Category
```
curl -X DELETE 'http://localhost:8080/categories/c47555d0-c641-11eb-a092-f79bd9a98d6e'
```

## Running Tests
- Run all tests: `npm test`
- Run tests in debug mode: `npm run test:debug`
- Run a single test: `npx mocha /path/to/test.mjs`
- Run a single test in debug mode: `npx mocha debug /path/to/test.mjs`

## Architecture
The API architecture is heavily inspired by [Redux](https://redux.js.org/).

- Instead of using a database, all state is kept in memory.
- To update state, an "action" must be dispatched.
- For persistence, actions are added to an append-only log. On restart, state is re-built (hydrated)
  by processing the append-only log.

## References
- [Redux docs](https://redux.js.org/)
- [Doing Without Databases in the 21st Century](https://codeburst.io/doing-without-databases-in-the-21st-century-6e25cf495373)
- [Using logs to build a solid data infrastructure](http://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html)
