#!/bin/bash

set -euo pipefail

# grep server_db_1 exits with non-zero exit code when the db isn't running
# swalling the error with '|| true'
DOCKER_DB_CONTAINER_ID=$(docker ps | grep server_db_1 || true | awk '{ print $1 }')

export PGPASSWORD=testing123

BASE_PSQL_CMD="psql -U gio -h 127.0.0.1 -p 15432 -d my_db"

TABLES=( "users" "admins" "sites" "posts" "comments" "_Migration" )

if [ -n "$DOCKER_DB_CONTAINER_ID" ]; then                                 
    echo "> Beginning Reset ..."
    echo "-----------------------"
    echo " "

    for TABLE in "${TABLES[@]}"
    do
        # https://stackoverflow.com/questions/13799789/expansion-of-variables-inside-single-quotes-in-a-command-in-bash
        $BASE_PSQL_CMD -c 'DROP TABLE "'"$TABLE"'" CASCADE;'
    done
else
    echo "> psql not running"
    exit 1
fi

