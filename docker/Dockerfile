FROM gcr.io/distroless/nodejs24-debian13:nonroot

USER nonroot:nonroot

COPY --chown=nonroot:nonroot [ "dist/index.js", "/app/" ]

WORKDIR /app

ENV OUTPUT_DOT_ENV_FILE_PATH="gatlingEnterprise.env"

CMD [ "index.js" ]
