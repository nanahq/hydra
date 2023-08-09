# Development stage
FROM node:19.6-alpine3.17 AS development

WORKDIR /usr/src/app

ARG APP
ENV APP=${APP}

COPY package*.json ./
RUN apk add --virtual builds-deps build-base python3
RUN yarn install

COPY . .

RUN yarn build ${APP}

# Production stage
FROM node:19.6-alpine3.17 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG APP
ENV APP=${APP}

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --virtual builds-deps build-base python3
RUN yarn install --frozen-lockfile

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["sh", "-c", "node dist/apps/$APP/main"]
