FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN ls -la node_modules/.bin
RUN ls -la node_modules/typescript/bin
RUN cat node_modules/.bin/tsc
RUN node node_modules/typescript/bin/tsc --version

RUN npm run build

EXPOSE 5001

CMD ["npm","start"]