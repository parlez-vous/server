
# Comment Server (Work In Progress)

Context: https://discourse.elm-lang.org/t/parlezvous-disqus-alternative-built-in-elm/6716/2


## Running Locally:

*Required Software*

- Docker
- Docker-Compose  ([link](https://docs.docker.com/compose/install/))

You need a `.env` file at the root of the project

Then run `docker-compose up`

This will boot up a postgresql db, then run migrations on the db and then start a nodejs server.

See `docker-compose.yml` for exposed ports for database and server.


