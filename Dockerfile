FROM node:24-alpine AS development
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma
RUN npm install
COPY src ./src
CMD ["npm", "run", "start:dev"]

FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma
RUN npm install
COPY src ./src
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main"]
