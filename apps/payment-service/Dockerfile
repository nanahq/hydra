# Development stage
FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN apk add --virtual builds-deps build-base python3
RUN yarn install

COPY . .

RUN yarn build payment-service

# Production stage
FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/payment-service/main"]
