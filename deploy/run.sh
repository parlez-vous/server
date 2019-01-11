#!/usr/bin/env bash

# Exit script if you try to use an uninitialized variable.
set -o nounset

# Exit script if a statement returns a non-true return value.
# set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail

COMMIT_REF="$1"

echo "booting up docker for branch:"
echo $COMMIT_REF

rm -rf .env

echo "PG_USERNAME=$2" >> .env
echo "PG_PASS=$3" >> .env
echo "GIT_SHA1=$4" >> .env

git fetch --all
git -c advice.detachedHead=false checkout -f "origin/$COMMIT_REF"

export COMPOSE_FILE="docker-compose.deploy.yml"

source .env

# pull images and run service
docker-compose up -d
