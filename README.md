
# Comment Server

## Running Locally:

*Required Software*

- Docker
- Docker-Compose  ([link](https://docs.docker.com/compose/install/))

You need a `.env` file at the root of the project

Then run `docker-compose up`

This will boot up a postgresql db, then run migrations on the db and then start a nodejs server.

See `docker-compose.yml` for exposed ports for database and server.


## TODO:

- remove use of hashids??
- allow for anonymous commenting
  - https://chancejs.com/text/sentence.html
- Create credentials


```
user_credentials
  user_id INT NOT NULL references users(id),
  password TEXT NOT NULL UNIQUE;

user_sessions
```
