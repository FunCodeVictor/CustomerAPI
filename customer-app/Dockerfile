FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

#Needed for Prisma getting the right OS binary
RUN npx prisma generate

COPY . .

#Database migration based on prisma/schema.prisma
RUN npx prisma migrate dev --name init

CMD ["npm","start"]