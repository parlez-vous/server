# This Dockerfile creates the Staging / Production image that runs on a remote server 

FROM node:10.16.0

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
COPY temp_do_src/ ./temp_do_src

RUN npm install && \
    npm run build

CMD [ "npm", "start" ]

