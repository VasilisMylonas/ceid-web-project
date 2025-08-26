FROM node:20
WORKDIR /usr/src/api
COPY package*.json ./
RUN npm install --omit=dev
COPY ./src .
CMD ["node", "server.js"]
