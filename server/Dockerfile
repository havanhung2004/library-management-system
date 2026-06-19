FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev
RUN npm ls typescript

RUN node_modules/.bin/tsc --version
RUN npx tsc --version
COPY . .
RUN npx tsc

EXPOSE 5001

CMD ["npm", "start"]