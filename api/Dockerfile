FROM node:18
WORKDIR /usr/src/api
COPY package*.json ./
RUN npm install --omit=dev
COPY ./src .
CMD ["node", "server.js"]
