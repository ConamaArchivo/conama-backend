FROM node:16.17.0-alpine

RUN apk add ghostscript

RUN apk add graphicsmagick

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 5000

CMD [ "node", "./bin/www" ]