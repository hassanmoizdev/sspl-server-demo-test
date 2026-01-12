FROM node:22.7-alpine
RUN apk update && apk upgrade
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

CMD ["npm", "start"]