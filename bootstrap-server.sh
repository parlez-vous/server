#!/bin/bash

set -e

timer="10"

echo "Postgres needs some setup time"
echo "Sleeping for $timer seconds"

sleep $timer

echo "Running db migrations"
npm run migrate:up

echo "Starting server"
npm start
