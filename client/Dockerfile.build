FROM node:20
WORKDIR /usr/src/client
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "build"]
