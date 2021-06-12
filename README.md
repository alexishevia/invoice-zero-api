# Invoice Zero API
Invoice Zero is a personal finance system meant to be simple, and easy to use.

1. [Getting Started](#getting-started)
2. [Persistence](#persistence)
3. [API](#api)
	1. [Accounts](#accounts)
		1. [List Accounts](#list-accounts)
		2. [Create Account](#create-account)
		3. [Get Account by ID](#get-account-by-id)
		4. [Update Account](#update-account)
		5. [Delete Account](#delete-account)
	2. [Categories](#categories)
		1. [List Categories](#list-categories)
		2. [Create Category](#create-category)
		3. [Get Category by ID](#get-category-by-id)
		4. [Update Category](#update-category)
		5. [Delete Category](#delete-category)
	3. [Income](#income)
		1. [List Income](#list-income)
		2. [Create Income](#create-income)
		3. [Get Income by ID](#get-income-by-id)
		4. [Update Income](#update-income)
		5. [Delete Income](#delete-income)
4. [Running Tests](#running-tests)
5. [Architecture](#architecture)
6. [References](#references)

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
```

#### List Accounts
```
curl -X GET 'http://localhost:8080/accounts'
```

#### Create Account
```
curl -X POST 'http://localhost:8080/accounts' \
  --header 'Content-Type: application/json' \
  -d '{"name": "Savings", "initialBalance": 300}'
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
```

#### List Categories
```
curl -X GET 'http://localhost:8080/categories'
```

#### Create Category
```
curl -X POST 'http://localhost:8080/categories' \
  --header 'Content-Type: application/json' \
  -d '{"name": "Groceries" }'
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

### Income

An income represents a deposit of money into an account.

Income objects have the following fields:

```
| field name      | type          | description                     | example                    |
| ---             | ---           | ---                             | ---                        |
| id              | string        | Unique identifier for the       | "aa39da77"                 |
|                 | non empty     | income.                         |                            |
|                 |               |                                 |                            |
| amount          | decimal       | The amount of money being       | 13.5                       |
|                 | bigger than 0 | deposited.                      |                            |
|                 |               |                                 |                            |
| accountID       | string        | ID of the account where the     | "1dc149bc"                 |
|                 | account ID    | income is being deposited into. |                            |
|                 |               |                                 |                            |
| categoryID      | string        | ID of the category associated   | "49f4d831"                 |
|                 | category ID   | with this income.               |                            |
|                 |               |                                 |                            |
| description     | string        | Additional notes for the        | "Freelance Project X"      |
|                 |               | income.                         |                            |
|                 |               |                                 |                            |
| transactionDate | string        | Date the income happened.       | "2019-10-12"               |
|                 | YYYY-MM-DD    |                                 |                            |
```

#### List Income
```
curl -X GET 'http://localhost:8080/income'
```

#### Create Income
```
curl -X request POST 'http://localhost:8080/income' \
  --header 'Content-Type: application/json' \
  -d '{
    "amount": 1.50,
    "accountID": "3b236180-cbac-11eb-b83e-2302669194e6",
    "categoryID": "cce25210-cbb7-11eb-bd78-49cc8f2ce11d",
    "description": "getting paid!",
    "transactionDate": "2021-06-12"
}'
```

#### Get Income by ID
```
curl -X GET 'http://localhost:8080/income/ed72ca80-cbbe-11eb-a10b-0fef5f4c1945'
```

#### Update Income
```
curl -X PATCH 'http://localhost:8080/income/ed72ca80-cbbe-11eb-a10b-0fef5f4c1945' \
  --header 'Content-Type: application/json' \
  -d '{ "amount": 2.45, "description": "mo money, no problems" }'
```

#### Delete Income
```
curl -X DELETE 'http://localhost:8080/income/79507f10-cbc0-11eb-8dc8-4f3fc972d5e6'
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
