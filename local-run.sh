#!/bin/bash

DIR=$(realpath -s $(dirname $0))

docker run \
  --name tiira-watcher \
  -p 8080:8080 \
  --rm -d tiira-watcher-ui
