FROM busybox:uclibc AS busybox

FROM gcr.io/distroless/nodejs24-debian13:nonroot

# We need to have a shell available for GitLab CI/CD
COPY --from=busybox /bin/sh /bin/sh

USER nonroot:nonroot

COPY --chown=nonroot:nonroot [ "dist/index.js", "/app/" ]
COPY --chown=nonroot:nonroot [ "etc/gatlingEnterpriseStart", "/app/bin/" ]

WORKDIR /app
ENV NODE_ENV=production
ENV PATH="$PATH:/app/bin:/nodejs/bin"
ENV OUTPUT_DOT_ENV_FILE_PATH="gatlingEnterprise.env"

CMD [ "gatlingEnterpriseStart" ]
