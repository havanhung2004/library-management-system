FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev
RUN npm ls typescript

RUN ls -la node_modules/.bin
COPY . .

RUN npm run build

EXPOSE 5001

CMD ["npm", "start"]