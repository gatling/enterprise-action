FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /
COPY [ "dist/index.js", "./app/" ]
COPY [ "etc/gatlingEnterpriseStart", "./app/bin/" ]
ENV PATH="$PATH:/app/bin"
ENV OUTPUT_DOT_ENV_FILE_PATH="gatlingEnterprise.env"
CMD [ "gatlingEnterpriseStart" ]
