# https://circleci.com/docs/2.0/custom-images/

FROM google/cloud-sdk:284.0.0-slim

WORKDIR /app

RUN apt-get -qqy update && \
    apt-get install -y python-yaml && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash -

RUN apt-get install -y nodejs && npm install -g prisma@1.34.10
