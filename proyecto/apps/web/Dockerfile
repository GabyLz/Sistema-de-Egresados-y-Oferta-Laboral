FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json .
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build --if-present

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
CMD ["npm","start"]
