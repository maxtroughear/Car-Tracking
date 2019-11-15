FROM node:10.17-alpine

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ENV PORT 3000

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE $PORT

CMD [ "npm", "start" ]