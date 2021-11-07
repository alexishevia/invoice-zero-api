#!/bin/bash

set -e # exit if any command fails

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE $DB_USER PASSWORD '$DB_PASSWORD' LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
    CREATE DATABASE $DB_NAME OWNER=$DB_USER;
EOSQL