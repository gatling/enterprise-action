FROM node:16-alpine
ENV NODE_ENV=production
WORKDIR /
COPY [ "dist/index.js", "./app/" ]
COPY [ "etc/gatlingEnterpriseStart", "./app/bin/" ]
ENV PATH="$PATH:/app/bin"
CMD [ "gatlingEnterpriseStart" ]
