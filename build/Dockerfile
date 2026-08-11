FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci

COPY . .
