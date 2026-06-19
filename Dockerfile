FROM node:20-alpine

RUN apk add --no-cache tzdata

ENV TZ=Africa/Algiers

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]