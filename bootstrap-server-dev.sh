#!/usr/bin/env bash

set -e

timer="10"

echo "Postgres needs some setup time"
echo "Sleeping for $timer seconds"

sleep $timer

echo "Running migrations"
npm run migrate-db:prod

echo "Starting server"
npm run start:dev
