# This Dockerfile creates the Staging / Production image that runs on a remote server 

FROM node:14.15-stretch

# Create app directory
WORKDIR /usr/app

# In production / staging, the following vars are 
# injected by GCP App Engine
# - DATABASE_URL
# - CRON_INTERVAL_MS

ENV PORT 8080
ENV NODE_PATH ./build

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src
COPY schema.prisma ./

RUN npm install && \
    npm run build

CMD [ "npm", "start" ]

