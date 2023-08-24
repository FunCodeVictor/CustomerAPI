# CustomerApp
Contains docker images of a database and application for retrieving data from it

Prerequisites:
1. Have docker installed ([Docker install link](https://docs.docker.com/engine/install/)) and runnning 

Optional:
1. Install mysql cli ([Mysql cli windows install link](https://dev.mysql.com/downloads/file/?id=521475)) to view database (connect to localhost with port 8080. User root pass secret_password). Should definitely be modified in case this should be used in more than PoC.
1.2 Connect with `mysqlsh -uroot -psecret_password -h 127.0.0.1 -P 3306 --database customerdb`

To run solution:
1. Be in `application` folder
2. Run `docker compose up -d` 
3. Await a few seconds after end, for customer-app to be connected with DB.


Dev notes:
Database migrations. Create with `npx prisma migrate dev --name init --create-only` where init is the name of the migration.
Run migrations with `npx prisma migrate dev`. If correct, move the generated named migration folder with .sql file within it (images/customer-app/migrations to mysql/migrations). Commit both (not ideal atm..)
Migrations will be run on DB when running docker compose up -d.

You can reset your DB with (very) small data sample (from application/customer-app/prisma/seed.ts) with by running following command inside customer-app docker image (`docker exec -it customer-app sh`) `npm prisma migrate reset`
To just empty the database run `npm prisma reset`

Useful Docker commands:
`docker compose up -d` runs the whole solution
`docker ps` (gives overall info about running containers)
`docker compose down --remove-orphans` Shuts down all containers including network (if in use)

Install vim in alpine container (customer-app):
`apk update`
`apk add vim`