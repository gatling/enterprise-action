FROM node:24-alpine

# The /gatlingEnterprise.env symlink is for backwards compatibility with previous version with no default user (root by
# default) and workdir="/" (although in practice we documented a relative path anyway).
# We now create a default user/group and use workdir="/app" which is owned by that user.
RUN addgroup -g 1001 -S gatling && \
    adduser -u 1001 -S gatling -G gatling && \
    ln -s /app/gatlingEnterprise.env /gatlingEnterprise.env
COPY --chown=gatling:gatling [ "dist/index.js", "./app/" ]
COPY --chown=gatling:gatling [ "etc/gatlingEnterpriseStart", "./app/bin/" ]

USER gatling
WORKDIR /app
ENV NODE_ENV=production
ENV PATH="$PATH:/app/bin"
ENV OUTPUT_DOT_ENV_FILE_PATH="gatlingEnterprise.env"

CMD [ "gatlingEnterpriseStart" ]
