FROM mcr.microsoft.com/playwright:v1.57.0-noble

ENV CI=true
ENV HEADLESS=true

COPY .  /app

WORKDIR /app

RUN chmod -R 755  /app