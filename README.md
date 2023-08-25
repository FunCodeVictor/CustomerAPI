# CustomerApp

## Overall solution consists of 3 docker containers:
1. `customer-db` is a simple mysql database.
2. `customer-app` is a server that runs Apollo which controls the GraphQL implementation. It also contains the database ORM (Prisma) with models and database setup.
3. `customer-parser` is a lambda functioning container. It parses (and contains for now) the csv `customer-store.csv` file and adds Customers to the database, using the `customer-app` GraphQL implementation.

## Direct answers to the assignment requirements

#### Parse the data from the csv file and keep the data you need,
1. This is done in the `customer-parser` container, triggered by [a curl on the host machine](#curl-commands).
2. The function `setCustomersToBeAdded` in `APICaller` checks which Customer id's already exists, and do try to add these again. Currently We also remove the stores that are related to this customer from being added again.

#### Act under the assumption that the csv file will be imported daily,
1. [The curl trigger](#curl-commands) can be setup to be sent during night by any machine. If set up in AWS, the trigger can be setup using an Events and rule. ([AWS Lambda schedule](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html))

##### If the customer does not exist in the database create a new one with Customer Name, Customer Id, SDP Id, Street Name and Phone Number
1. Database models design can be viewed as a png here `documentation/database-models/DatabaseModels.png` (just drawn at draw.io).
2. Database models is implemented in Prisma here `application/customer-app/prisma/shcema.prisma`
3. CSV is read and added using `customer-parser` container mentioned above
4. The GraphQL api in `customer-app/src/CustomerResolver` `createCustomer` is responsible for creating the database objects using the Prisma ORM
5. The function `setCustomersToBeAdded` in `APICaller` checks which Customer id's already exists
6. As the id is the primary key, the database can't create a customer if the id already exists.

##### If the store does not exist on the Customer, create it on the Customer it belongs to with Store name, Distribution Centre Name, Open and Close Date
1. It is created now if the customer does not exist as well. Need to implement this in the `customer-parser` lambda.
2. Can be manually added with the GraphQL api `customer-app/src/StoreResolver` `createStore`, where you provide the customer id.

#### Duplicated Customer or Stores should not be added to the database
1. The function `setCustomersToBeAdded` in `APICaller` checks which Customer id's already exists
2. There's id primary keys on both stores and customers, why they wont be added in the database either, however, there should be a filter method implemented to do this before making the request of course.

#### Create a simple API to retrieve both Customer & Store Data
1. When [running the solution](#running-the-solution), an API server (Apollo) is setup and run in the `customer-app` container.
2. You can see all API's and interact with there on you local network `http://localhost:4000/`
3. The API can also be interacted with using curl. [Here are some example curl commands for creating and viewing customers and stores](#example-curl-commands-interacting-the-with-api).


## Running the solution

Prerequisites:
1. Have docker installed ([Docker install link](https://docs.docker.com/engine/install/)) and runnning 

Optional:
1. Install mysql cli ([Mysql cli windows install link](https://dev.mysql.com/downloads/file/?id=521475)) to view database (connect to localhost with port 8080. User root pass secret_password). Should definitely be modified in case this should be used in more than PoC.
1.2 Connect with `mysqlsh -uroot -psecret_password -h 127.0.0.1 -P 3306 --database customerdb`

To run solution:
1. Be in `application` folder
2. Run `docker compose up -d` 
3. Await a few seconds after end, for customer-app to be connected with DB.


### Curl commands

#### To trigger lambda customer-parser container:
1. Make sure all containers run

##### Windows
2. You might have to remove a "curl alias" before it works (`Remove-item alias:curl`)
3. Open terminal and run `curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d "{}"`

##### LinuxBased
2. Open terminal and run `curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'`

#### Example curl commands interacting the with API

Note, it is very easy to choose which fields you want returned, based on what you need. You simply just modify which fields you want in  the "query".

##### See all Customers and Stores
###### LinuxBased
1. run 
`
curl --request POST \
    --header 'content-type: application/json' \
    --url http://localhost:4000/ \
    --data '{"query":"query AllCustomers {\n  allCustomers {\n    id\n    customerName\n    sdpId\n    streetName\n    phoneNumber\n    stores {\n      id\n      storeName\n      distributionCenterName\n      openDate\n      closeDate\n    }\n  }\n}","variables":{}}'
`

###### Windows
1. First create a `data.json` local file in your current directory 
    1. Content of the file:
    `
    {
    "query":"query AllCustomers {\n  allCustomers {\n    id\n    customerName\n    sdpId\n    streetName\n    phoneNumber\n    stores {\n      id\n      storeName\n      distributionCenterName\n      openDate\n      closeDate\n    }\n  }\n}",
    "variables":{}
    }
    `

2. run `curl --% --request POST --header "content-type: application/json" --url http://localhost:4000/ --data "@data.json"`


##### Add customer curl

###### LinuxBased
1. run 
`
curl --request POST \
    --header 'content-type: application/json' \
    --url http://localhost:4000/ \
    --data '{"query":"mutation Mutation($data: CustomerCreateInput!) {\r\n  createCustomer(data: $data) {\r\n    id\r\n    customerName\r\n    sdpId\r\n    phoneNumber\r\n    streetName\r\n    stores {\r\n      id\r\n      storeName\r\n      distributionCenterName\r\n      openDate\r\n      closeDate\r\n    }\r\n  }\r\n}","variables":{"data":{"id":102030,"customerName":"Mega cool customer","sdpId":6,"phoneNumber":"11223344","streetName":"Koegevej","stores":[{"storeName":"Mega cool store","distributionCenterName":"Mega cool distribution center","openDate":"2016-10-30T15:27:02.000Z","closeDate":"9999-12-31T15:27:02.000Z","customerId":102030},{"storeName":"Mega second cool store","distributionCenterName":"Mega cool distribution center","openDate":"2023-09-04T15:27:02.000Z","closeDate":null,"customerId":102030}]}}}'
`

###### Windows
1. First create a `data.json` local file in your current directory 
    1. Content of the file:
    `
    {
    "query": "mutation CreateCustomer($data: CustomerCreateInput!) {\n  createCustomer(data: $data) {\n    customerName\n    stores {\n      storeName\n    }\n  }\n}",
    "variables": {
        "data": {
            "id": 102030,
            "customerName": "Mega cool customer",
            "sdpId": 6,
            "phoneNumber": "11223344",
            "streetName": "Koegevej",
            "stores": [{
                "storeName": "Mega cool store",
                "distributionCenterName": "Mega cool distribution center",
                "openDate": "2016-10-30T15:27:02.000Z",
                "closeDate": "9999-12-31T15:27:02.000Z",
                "customerId": 102030
                }, {
                "storeName": "Mega second cool store",
                "distributionCenterName": "Mega cool distribution center",
                "openDate": "2023-09-04T15:27:02.000Z",
                "closeDate": null,
                "customerId": 102030
                }
            ]}
        }
    }
    `
2. run `curl --request POST --header 'content-type: application/json' --url http://localhost:4000/ -d "@data.json"`


### Unit tests
Currently only some unit tests in the `customer-parser` container.
To run unit tests in `customer-parser`:
1. cd into application/customer-app/
2. run `npm test` (make sure you have run `npm install` once before)


### Notes
#### Database
##### Database migrations 
1. Create with `npx prisma migrate dev --name init --create-only` where init is the name of the migration.
Run migrations with `npx prisma migrate dev`. If correct, move the generated named migration folder with .sql file within it (images/customer-app/migrations to mysql/migrations). Commit both (not ideal atm..)
2. Migrations will be run on DB when running docker compose up -d.

##### Data reset
1. You can reset your DB with (very) small data sample (from application/customer-app/prisma/seed.ts) with by running following command inside customer-app docker image (`docker exec -it customer-app sh`) `npm prisma migrate reset`
2. To just empty the database run `npm prisma reset`

#### Docker
1. Useful Docker commands:
* `docker compose up -d` runs the whole solution
* `docker ps` (gives overall info about running containers)
* `docker compose down --remove-orphans` Shuts down all containers including network (if in use)

2. Install vim in alpine container (customer-app):
* `apk update`
* `apk add vim`

#### Quickstarts used
1. [Prisma ORM Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
    1. `customer-parser` APIs
    2. `customer-app` Database models
2. [Apollo GraphQL Get started with Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/)
    1. `customer-app` Setup the GraphQL server and APIs

3. [AWS Testing Lambda container images locally](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html)
    1. `customer-parser` Triggering a handler container

4. [MySQL docker image](https://hub.docker.com/_/mysql)
    1. `cusomter-db` just starting the database container 
    