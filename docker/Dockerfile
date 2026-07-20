FROM debian:trixie AS builder

RUN apt-get update && apt-get install -y busybox
RUN mkdir -p /tmp/usr/bin && \
    for i in $(busybox --list); do ln -s busybox /tmp/usr/bin/$i; done && \
    cp /usr/bin/busybox /tmp/usr/bin/

FROM gcr.io/distroless/nodejs24-debian13:nonroot

# We need a shell and some basic utilities (touch, chmod, mkdir, cat) for GitLab CI/CD
COPY --from=builder /tmp/usr/bin /usr/bin

USER nonroot:nonroot

COPY --chown=nonroot:nonroot [ "dist/index.js", "/app/" ]
COPY --chown=nonroot:nonroot [ "etc/gatlingEnterpriseStart", "/app/bin/" ]

WORKDIR /app
ENV NODE_ENV=production
ENV PATH="$PATH:/app/bin:/nodejs/bin"
ENV OUTPUT_DOT_ENV_FILE_PATH="gatlingEnterprise.env"

CMD [ "gatlingEnterpriseStart" ]
