FROM node:latest

WORKDIR /usr/src/groi-api

COPY package.json ./

RUN npm i -g nodemon
RUN npm i

COPY ./ ./

CMD ["npm", "start"]
