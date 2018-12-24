FROM node:8

# Create app directory
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY bootstrap-server.sh ./
COPY src/ ./src
COPY knexfile.js ./
COPY migrations/ ./migrations

# If you are building your code for production
# RUN npm install --only=production
RUN npm install && npm run build && chmod +x ./bootstrap-server.sh

EXPOSE 3000

CMD [ "/usr/app/bootstrap-server.sh"]
