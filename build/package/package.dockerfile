# see ./docker.package.tasks.yml on how this container is created
FROM node:current-alpine
ARG TARGET_PATH=/versionlens
ENV PACKAGE_OUT_PATH=.package

COPY / $TARGET_PATH

WORKDIR $TARGET_PATH

# install deps
RUN npm install -g npm @vscode/vsce js-build-tasks

RUN npm install

# run tests
RUN task build:test

# bundle
RUN task bundle

# create artifacts folder
RUN mkdir $PACKAGE_OUT_PATH

# package vsix and move it to artifacts folder
CMD vsce package && mv *.vsix $PACKAGE_OUT_PATH