# syntax=docker/dockerfile:1
FROM node:24-alpine
WORKDIR /app
COPY server.mjs ./
ENV NODE_ENV=production
ENV PORT=8787
ENV REVIEW_DB_PATH=/data/review.db
EXPOSE 8787
CMD ["node", "server.mjs"]
