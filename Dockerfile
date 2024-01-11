FROM node:20.9.0-alpine
COPY . /ics
WORKDIR /ics

RUN npm run clean:all \
    && npm ci \
    && npm run build

EXPOSE 8080

USER root

RUN apk update \
  && apk add --no-cache ca-certificates

CMD ["npm", "run", "start"]
