# see ./docker.test.tasks.yml on how this container is created
FROM node:current-alpine
ARG TARGET_PATH=/versionlens

COPY / $TARGET_PATH

WORKDIR $TARGET_PATH

RUN npm install -g npm js-build-tasks

RUN npm install

CMD task coverage