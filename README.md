# Invoice Zero API
Invoice Zero is a personal finance system meant to be simple, and easy to use.

1. [Getting Started](#getting-started)
2. [The .tmp directory](#the-tmp-directory)
3. [Auto-reload](#auto-reload)
4. [NPM dependencies: package.json and node_modules](#npm-dependencies-packagejson-and-node_modules)
5. [Pushing your changes / Git Hooks](#pushing-your-changes--git-hooks)
6. [Running Tests](#running-tests)
7. [Debugging](#debugging)
8. [Architecture](#architecture)
9. [Models](#models)
	1. [Accounts](#accounts)
	2. [Categories](#categories)
	3. [Income](#income)
	4. [Expenses](#expenses)
	5. [Transfers](#transfers)
10. [Deployment](#deployment)

## Getting Started
1. Install [Docker](https://www.docker.com/get-started)
2. Create a `.env` file in the directory root with the following info:
```
PORT=8080
INSPECTOR_PORT=9229
TEST_INSPECTOR_PORT=9230
AUTH_TYPE=basic
AUTH_USERNAME=auth_username
AUTH_PASSWORD=auth_password
DB_ROOT_PASSWORD=postgres_root_password
DB_NAME=izapi
DB_USER=izapi
DB_PASSWORD=izapi_pwd
```

3. Run `./bin/start` to start the nodeJS service and its dependencies using docker. Once the
   service initializes, it should be available on `http://localhost:8080`
    (or whichever port you set for `PORT` in `.env`)

Optional:
Install [nodeJS](https://nodejs.org/en/) and run `npm install` to install some development tools, like eslint and prettier.

## The .tmp directory
After running `docker-compose up`, you'll notice a `.tmp` directory is created. This
directory holds files that are generated when running the app (ie: data files).

For the most part, you should not need to edit files in this directory manually.

If you decide to nuke this directory, it will delete all data for your app, and you would start from
a "blank slate" again when you restart the app.

## Auto-reload
The service is configured to auto-reload on code changes, using [nodemon](https://nodemon.io/).

However, you will have to manually restart the service if you edit your `.env` file, or after
running database migrations.

## Running Tests
- Run all tests: `./bin/test`
- Run all tests in debug mode: `./bin/test_debug`
    The nodeJS inspector will be running on `127.0.0.1:9230` 
    (or whichever port you set for `TEST_INSPECTOR_PORT` in `.env`)
    See [Inspector Clients](https://nodejs.org/en/docs/guides/debugging-getting-started/#inspector-clients) for info on how to connect to the inspector.
- Run a single test: `./bin/test path/to/test.mjs`
    eg: `./bin/test tests/accounts/createAccount.test.mjs`
- Run a single test in debug mode: `./bin/test_debug path/to/test.mjs`
    eg: `./bin/test_debug tests/accounts/createAccount.test.mjs`

## Debugging
By default, the app runs with the [node inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/) running on 127.0.0.1:9229.
(or whichever port you set for `INSPECTOR_PORT` in `.env`)

See [Inspector Clients](https://nodejs.org/en/docs/guides/debugging-getting-started/#inspector-clients) for info on how to connect to the inspector.

## NPM dependencies: package.json and node_modules
You'll notice this repo has two `package.json` files:
1. `./package.json`
2. `./api/package.json`

The top-level `package.json` defines modules that run in your local (aka host) machine, for
development purposes. eg: `eslint, prettier, husky`

The `./api/package.json` defines modules that run in the docker container, for the app to run.
eg: `express`

When installing new modules:
- if it is a module that will run in the host machine:
    run `npm install` in your computer
- if it is a module that will run in the docker container:
    run `npm install` in the api container, eg: `docker-compose run api npm install express`

## Database Migrations
This app uses [db-migrate](https://db-migrate.readthedocs.io/en/latest/) for migrations.

- To create a new migration: `./bin/migrations_new your_migration_name`
    eg: `./bin/migrations_new add_accounts_table`
    You'll see two new files ("up" and "down") added in `./db/migrations/sqls/`. Add your SQL queries there.
- To run migrations: `./bin/migrations_up`
- To rollback migrations: `./bin/migrations_down`

## Pushing your changes / Git Hooks
This repo is configured with some git hooks that should help with code quality:
- on `git commit`: [prettier](https://prettier.io/) runs on all files being added.
- on `git push`: all tests are executed, and pushing is blocked if any test fails.
    see [Running Tests](#running-tests) if you're having issues.

Note: The hooks are installed by [husky](https://www.npmjs.com/package/husky) when you run `npm install` on your local machine.

## Architecture
The API architecture is heavily inspired by [Redux](https://redux.js.org/).

- Instead of using a database, all state is kept in memory.
- To update state, an "action" must be dispatched.
- For persistence, actions are added to an append-only log. On restart, state is re-built (hydrated)
  by processing the append-only log.

References:
- [Redux docs](https://redux.js.org/)
- [Doing Without Databases in the 21st Century](https://codeburst.io/doing-without-databases-in-the-21st-century-6e25cf495373)
- [Using logs to build a solid data infrastructure](http://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html)


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
|                 | bigger than 0 | withdrawn.                        |                            |
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
      - /path/to/your/local/file.mdjson:/invoice-zero-api.mdjson
```

If you are the owner of this repo, and you're ready to deploy a new version:
1. Test the `Dockerfile`

Build image: `docker build . -t alexishevia/invoice-zero-api`
Run container: 
```
docker run \
  -v /tmp/invoice-zero-api.mdjson:/invoice-zero-api.mdjson \
  -e AUTH_USERNAME="foo" \
  -e AUTH_PASSWORD="bar" \
  -p 8080:8080 \
  --name izapi \
  alexishevia/invoice-zero-api
```
Stop/remove container: `docker stop izapi && docker rm izapi`

2. Update the `version` in `package.json` and commit change
3. Run `./bin/deploy`

The `./bin/deploy` script:
- reads the `version` from `api/package.json`
- creates a new git tag and pushes it to origin
- builds the docker image from `Dockerfile` with latest code
- tags the docker image and pushes to dockerhub
