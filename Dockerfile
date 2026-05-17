FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app

# `CI=true` makes the `is-ci || husky` prepare hook short-circuit before
# invoking husky during install — husky needs `.git`, which is intentionally
# not copied into the build context.
ENV CI=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Pinned to pnpm 10 — matches our pnpm-workspace.yaml which uses the v10
# `onlyBuiltDependencies` field to whitelist build scripts for transitive
# deps (@nestjs/core, @swc/core, core-js, unrs-resolver, @scarf/scarf,
# esbuild). Without that field honored, pnpm 10 errors on
# `[ERR_PNPM_IGNORED_BUILDS]`.
RUN npm install -g pnpm@10 && pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm build

EXPOSE 3000

ENV PORT=3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
