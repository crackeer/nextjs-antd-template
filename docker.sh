#!/bin/bash
# 开启Docker BuildKit
export DOCKER_BUILDKIT=1
export HTTPS_PROXY=http://127.0.0.1:7897
export HTTP_PROXY=http://127.0.0.1:7897
docker build -t nextjs-antd-template .
