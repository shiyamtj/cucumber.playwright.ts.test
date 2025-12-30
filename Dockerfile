FROM mcr.microsoft.com/playwright:v1.55.0-noble

ENV CI=true
ENV HEADLESS=true

COPY .  /app

WORKDIR /app

RUN chmod -R 755  /app