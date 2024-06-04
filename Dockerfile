# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS build
COPY package.json bun.lockb ./
COPY tsconfig.json ./
COPY src ./src
RUN bun install --frozen-lockfile --production
ENV NODE_ENV=production

RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=build /app/dist/nana ./

# run the app
USER bun
ENTRYPOINT [ "/app/nana" ]
