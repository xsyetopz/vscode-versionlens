# see ./docker.publish.tasks.yml on how this container is created
FROM node:current-alpine
ARG TARGET_PATH=/versionlens

# update os packages
RUN apk update && apk upgrade

# copy in project files (minus the .dockerignore entries)
COPY / $TARGET_PATH

# set the $CWD to the project root
WORKDIR $TARGET_PATH

# update npm to latest
RUN npm install -g npm @vscode/vsce js-build-tasks

# install dependencies
RUN npm ci

# run tests
RUN task build:test

# bundle
RUN task bundle

# package the extension
RUN vsce package

# move package to artifacts
RUN mkdir ./artifacts
RUN mv *.vsix ./artifacts

# publish the package
CMD vsce publish