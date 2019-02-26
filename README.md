
# Comment Server (Work In Progress)

Roadmap viewable here:

https://trello.com/b/2NtXSuwt/parlez-vous

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

- Add 404 route
- Rate limit by IP (i.e. prevent ddos)
- Validate domain ownership

```
const dns = require('dns');

dns.resolve(
  'gdelgado.ca', 
  'TXT', 
  (err, result) => { console.log(result) }
)
```

- DB Backups

- Analytics?
  - probably better as a separate product
  
- Pin important comments (server side)



### Things to test

- [ ] Sessions expire after one week of inactivity (currently, sessions are reset when users log in)
