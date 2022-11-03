FROM node:alpine As development

WORKDIR /usr/src/app

ARG APP
ENV APP ${APP}

COPY package*.json ./
RUN apk --no-cache add --virtual builds-deps build-base python3
RUN npm install

COPY . .

RUN npm run build ${APP}

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG APP
ENV APP ${APP}

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add --virtual builds-deps build-base python3
RUN npm ci


COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/${APP}/main"]
