FROM node:19.6-alpine3.17 As development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build admin-gateway

FROM node:19.6-alpine3.17 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci


COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/admin-gateway/main"]
