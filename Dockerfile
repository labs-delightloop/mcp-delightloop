FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm build

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/index.js"]
