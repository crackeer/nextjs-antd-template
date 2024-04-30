FROM golang:1.19-alpine

WORKDIR /var/gocode/server
ADD ./server/ ./

RUN echo -e http://mirrors.ustc.edu.cn/alpine/v3.17/main/ >/etc/apk/repositories
RUN export GO111MODULE=on
ENV GOPROXY https://goproxy.cn,direct
RUN go mod tidy
RUN go build -o server-linux .


FROM node18/alpine
# 指定工作路径
WORKDIR /var/nodecode/
ADD ./ ./
RUN npm install -f
RUN export NODE_ENV=production
RUN npm run build

# ------------------------- 输出最终镜像 ---------------------------------

FROM alpine:latest
RUN apk update && apk add zip tzdata curl wget
ARG TAG
COPY ./envs/env.${TAG} /data0/www/htdocs/nextjs-antd-template/bin/.env
COPY ./scripts/run.sh /data0/www/htdocs/nextjs-antd-template/bin/run.sh
COPY ./APP_ID /data0/www/htdocs/nextjs-antd-template/bin/APP_ID
COPY --from=0 /var/gocode/server/server-linux  /data0/www/htdocs/nextjs-antd-template/bin/
COPY --from=1 /var/nodecode/out /data0/www/htdocs/nextjs-antd-template/out
EXPOSE 80

WORKDIR /data0/www/htdocs/nextjs-antd-template/bin

CMD sh /data0/www/htdocs/nextjs-antd-template/bin/run.sh run

