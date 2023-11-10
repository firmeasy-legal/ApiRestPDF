FROM node:lts-alpine

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \ 
	npm install -g pnpm

RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
	--mount=type=cache,target=/root/.local/share/pnpm/store \
	pnpm install --frozen-lockfile

ENV NODE_ENV development

COPY . .

EXPOSE 3000

RUN pnpm run db:client:generate

CMD pnpm run dev