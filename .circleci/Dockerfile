# https://circleci.com/docs/2.0/custom-images/

FROM google/cloud-sdk:251.0.0-slim

WORKDIR /app

RUN apt-get -qqy update && \
    apt-get install -y python-yaml && \
    apt-get install -y nodejs
    