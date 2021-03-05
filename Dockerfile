FROM node:15.8.0-alpine3.13

WORKDIR /blockcite

COPY . . 
RUN npm install

CMD ["node", "blockcite.js"]