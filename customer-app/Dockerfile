FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

#Needed for Prisma getting the right OS binary
RUN npx prisma generate

COPY . .

CMD ["npm","start"]