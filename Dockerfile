# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.18.1

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

ARG APPDIR=/app
# Set working directory for all build stages.
WORKDIR ${APPDIR}

################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage bind mounts to package.json and yarn.lock to avoid having to copy them
# into this layer.

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM base as build

# Copy the rest of the source files into the image.
COPY . .

# Download additional development dependencies before building
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Run the build script.
RUN yarn run clean:build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

ARG APPDIR=/app
# Use production node environment by default.
ENV NODE_ENV production

#.npmrc file not copied in
# Copy package.json so that package manager commands can be used.
COPY --chown=node:node package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps --chown=node:node ${APPDIR}/node_modules ./node_modules/
COPY --from=build --chown=node:node ${APPDIR}/build/prisma ./prisma/
COPY --from=build --chown=node:node ${APPDIR}/build/src ./src/
COPY --chown=node:node prisma/schema.prisma ./prisma/
COPY --chown=node:node config.yaml .
COPY --chmod=0755 --chown=node:node run.sh .

# Expose the port that the application listens on.
EXPOSE 8890

# Run the application as a non-root user.
USER node

# Running prisma generate as node user to not break node_module/.prisma ownership and perms
RUN yarn run prisma:generate

# Run the application.
CMD ["./run.sh"]