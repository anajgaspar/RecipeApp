FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /app/dist ./dist
EXPOSE 3002
CMD ["npm", "start"]