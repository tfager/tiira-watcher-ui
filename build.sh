#!/bin/bash
# Just for local testing, proper build is in GHA

docker build \
    -t tiira-watcher-ui \
    --build-arg BUILD_ENV=production \
    .
