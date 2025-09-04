FROM node:20
WORKDIR /usr/src/api
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
CMD ["npm", "start"]
