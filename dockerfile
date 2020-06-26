FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY ./init-mongo.js /docker-entrypoint-initdb.d/

EXPOSE 2020
EXPOSE 27017

CMD ["npm", "start"]
