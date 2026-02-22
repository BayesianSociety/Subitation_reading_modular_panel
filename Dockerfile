FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .
RUN mkdir -p /app/storage

ENV PORT=3000
ENV DB_PATH=/app/storage/app.db

EXPOSE 3000

CMD ["npm", "start"]
