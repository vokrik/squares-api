FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add chromium
RUN apk add bash
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "./node_modules/.bin/pm2-runtime", "start", "index.js" ]
