# see ./test.gitlab-ci.yml for cmdline example of how to run on local docker
FROM node:22-alpine3.19
ARG TARGET_PATH=/versionlens

COPY / $TARGET_PATH

WORKDIR $TARGET_PATH

RUN npm install -g npm
RUN npm install
CMD npm test:unit