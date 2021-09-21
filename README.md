# Invoice Zero API
Invoice Zero is a personal finance system meant to be simple, and easy to use.

1. [Getting Started](#getting-started)
2. [Persistence](#persistence)
3. [Models](#models)
	1. [Accounts](#accounts)
	2. [Categories](#categories)
	3. [Income](#income)
	4. [Expenses](#expenses)
	5. [Transfers](#transfers)
4. [Running Tests](#running-tests)
5. [Docker Image](#docker-image)
6. [Deployment](#deployment)
7. [Architecture](#architecture)
8. [References](#references)

## Getting Started
1. Install [nodeJS](https://nodejs.org/) (v14.17.0 preferred)
2. Run `npm install` to install all dependencies
3. Create a `.env` file in the directory root with the following info:
    ```
    PORT=8080
    AUTH_TYPE="basic"
    AUTH_USERNAME="your_username"
    AUTH_PASSWORD="your_password"
    ```
4. Run `npm start` to start the server on `http://localhost:8080`

## Persistence
By default, data is only kept in memory. All data will be lost once the server is shut down.

To enable file-based persistence:
1. Create a new file to hold data, eg: `touch /tmp/invoice-zero-api.mdjson`
2. Add the following fields to your `.env` file:
```
PERSISTENCE_TYPE="file"
PERSISTENCE_FILEPATH="/tmp/invoice-zero-api.mdjson"
```

## Models

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
| initialBalance | int           | Amount of money (cents) in the | 30000                      |
|                |               | account before tracking        |                            |
|                |               | transactions in IZ.            |                            |
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

### Income
An income represents a deposit of money into an account.

Income objects have the following fields:

```
| field name      | type          | description                     | example                    |
| ---             | ---           | ---                             | ---                        |
| id              | string        | Unique identifier for the       | "aa39da77"                 |
|                 | non empty     | income.                         |                            |
|                 |               |                                 |                            |
| amount          | int           | The amount of money (cents)     | 1350                       |
|                 | bigger than 0 | being deposited.                |                            |
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

### Expenses
An expense represents a withdrawal of money from an account.

Expenses have the following fields:

```
| field name      | type          | description                       | example                    |
| ---             | ---           | ---                               | ---                        |
| id              | string        | Unique identifier for the         | "aa39da77"                 |
|                 | non empty     | expense.                          |                            |
|                 |               |                                   |                            |
| amount          | int           | The amount of money (cents) being | 1350                       |
|                 | bigger than 0 | withdrawed.                       |                            |
|                 |               |                                   |                            |
| accountID       | string        | ID of the account where the money | "1dc149bc"                 |
|                 | account ID    | is being withdrawn from.          |                            |
|                 |               |                                   |                            |
| categoryID      | string        | ID of the category associated     | "49f4d831"                 |
|                 | category ID   | with this expense.                |                            |
|                 |               |                                   |                            |
| description     | string        | Additional notes for the          | "Whole Foods Market"       |
|                 |               | expense.                          |                            |
|                 |               |                                   |                            |
| transactionDate | string        | Date the expense happened.        | "2019-10-12"               |
|                 | YYYY-MM-DD    |                                   |                            |
```

### Transfers
A transfer represents an exchange of money between two accounts.

Transfers have the following fields:

```
| field name      | type          | description                       | example                    |
| ---             | ---           | ---                               | ---                        |
| id              | string        | Unique identifier for the         | "aa39da77"                 |
|                 | non empty     | transfer.                         |                            |
|                 |               |                                   |                            |
| amount          | int           | The amount of money (cents) being | 1350                       |
|                 | bigger than 0 | transferred.                      |                            |
|                 |               |                                   |                            |
| fromID          | string        | ID of the account where the money | "1dc149bc"                 |
|                 | account ID    | is coming from.                   |                            |
|                 |               |                                   |                            |
| toID            | string        | ID of the account where the money | "49f4d831"                 |
|                 | account ID    | is headed to.                     |                            |
|                 |               |                                   |                            |
| transactionDate | string        | Date the transfer happened.       | "2019-10-12"               |
|                 | YYYY-MM-DD    |                                   |                            |
```

## Running Tests
- Run all tests: `npm test`
- Run tests in debug mode: `npm run test:debug`
- Run a single test: `npx mocha /path/to/test.mjs`
- Run a single test in debug mode: `npx mocha debug /path/to/test.mjs`

## Docker Image
To make deployment easier, a `Dockerfile` is included.

Build image: `docker build . -t alexishevia/invoice-zero-api`
Run container: 
```
docker run -d \
  -v /tmp/invoice-zero-api.mdjson:/invoice-zero-api.mdjson \
  -p 8080:8080 \
  --name izapi \
  alexishevia/invoice-zero-api
```
Stop/remove container: `docker stop izapi && docker rm izapi`

## Deployment
This API is meant to be selfhosted. Here is a sample `docker-compose.yml`:
```yaml
version: "3.3"

services:
  izapi:
    image: alexishevia/invoice-zero-api:latest
    restart: unless-stopped
    environment:
      - PORT=8080
      - PERSISTENCE_TYPE="file"
      - PERSISTENCE_FILEPATH="/actions.mdjson"
      - AUTH_TYPE="basic"
      - AUTH_USERNAME=${YOUR_USERNAME_ENV_VARIABLE}
      - AUTH_PASSWORD=${YOUR_PASSWORD_ENV_VARIABLE}
    volumes:
      # all processed actions will be stored in this file
      - /izapi_actions.mdjson:/actions.mdjson
    ports:
      - 80:8080
```

If you are the owner of this repo, and you're ready to deploy a new version:
1. Update the `version` in `package.json`
2. Run `./bin/deploy`

The `./bin/deploy` script:
- reads the `version` from `package.json`
- creates a new git tag and pushes it to origin
- builds the docker image with latest code
- tags the docker image and pushes to dockerhub


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
