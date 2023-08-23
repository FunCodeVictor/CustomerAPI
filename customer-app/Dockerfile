FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

RUN npx prisma generate


COPY . .

CMD ["npm","start"]