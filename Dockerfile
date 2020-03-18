FROM node:10.16.0

# Create app directory
WORKDIR /usr/app

ENV CRON_INTERVAL_MS 5000
ENV PRISMA_ENDPOINT http://prisma:4466
ENV PORT 8080


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
COPY bootstrap-server-dev.sh ./
COPY src/ ./src

RUN npm install && npm run build

CMD [ "/usr/app/bootstrap-server-dev.sh" ]
