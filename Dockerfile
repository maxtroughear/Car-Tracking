FROM node:10.16-alpine

ENV SECRET SOMESECRET
ENV PORT 3000
ENV MAXLOCATION 10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]