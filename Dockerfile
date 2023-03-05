FROM node:19.6-alpine3.17 As development

WORKDIR /usr/src/app

ARG APP
ENV APP=${APP}

COPY package*.json ./
RUN apk  add --virtual builds-deps build-base python3
RUN npm install

COPY . .

RUN npm run build ${APP}

FROM node:19.6-alpine3.17 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG APP
ENV APP=${APP}

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk  add --virtual builds-deps build-base python3
RUN npm ci


COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["sh", "-c", "node dist/apps/$APP/main"]
