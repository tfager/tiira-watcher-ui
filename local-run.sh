#!/bin/bash

DIR=$(realpath -s $(dirname $0))

docker run \
  --name tiira-watcher \
  -p 8080:8080 \
  --rm -d tiira-watcher-ui

#  -v ${DIR}/resources:/usr/share/nginx/html:ro \
#  -v ${DIR}/nginx/default.conf:/etc/nginx/conf.d/default.conf \
