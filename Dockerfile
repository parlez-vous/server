FROM node:10.16.0

# Create app directory
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src

RUN npm install && npm run build

CMD [ "npm", "run", "start:prod" ]
