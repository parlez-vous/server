#!/bin/bash

set -e

timer="10"

echo "Postgres needs some setup time"
echo "Sleeping for $timer seconds"

sleep $timer

echo "Running db migrations"
npm run migrate:up

# NODE_PATH=./build is the runtime version of tsconfig's "baseUrl" setting
# https://stackoverflow.com/questions/42582807/typescript-baseurl-with-node-js
echo "Starting server"
NODE_PATH=./build npm start
