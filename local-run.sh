#!/bin/bash

DIR=$(realpath -s $(dirname $0))

docker run \
  --name tiira-watcher \
  -v ${DIR}/resources:/usr/share/nginx/html:ro \
  -v ${DIR}/nginx/default.conf:/etc/nginx/conf.d/default.conf \
  -p 8080:80 \
  --rm -d nginx