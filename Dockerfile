FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm build

EXPOSE 3000

ENV PORT=3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
