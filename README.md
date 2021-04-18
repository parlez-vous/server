
# Comment Server (Work In Progress)

Context: https://discourse.elm-lang.org/t/parlezvous-disqus-alternative-built-in-elm/6716/2


## Running Locally:

*Required Software*

- Docker
- Docker-Compose  ([link](https://docs.docker.com/compose/install/))

Then run `docker-compose up`

This will boot up a postgresql db, then run migrations on the db and then start a nodejs server.

Open `localhost:8080/health-check` to confirm the api is working

After making any changes outside src (like adding a new migration or a new package), run `docker-compose up --build` again, this will rebuild the container with the new changes. 

