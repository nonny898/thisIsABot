FROM node:12.10.0-alpine
EXPOSE 5000 5001 9005
WORKDIR /usr/src/
ENV HOST 0.0.0.0
RUN apk update \
&& apk add --update alpine-sdk \
&& apk del alpine-sdk \
&& rm -rf /tmp/* /var/cache/apk/* *.tar.gz ~/.npm \
&& npm cache verify \
&& sed -i -e "s/bin\/ash/bin\/sh/" /etc/passwd \
&& npm install -g firebase-tools