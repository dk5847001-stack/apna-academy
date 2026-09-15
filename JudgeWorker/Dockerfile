FROM node:22-bookworm-slim

WORKDIR /app
COPY package.json ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 6000

USER node
CMD ["node", "src/server.js"]
