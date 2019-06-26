# https://circleci.com/docs/2.0/custom-images/

FROM google/cloud-sdk:251.0.0-slim

WORKDIR /app

COPY generate-app-yaml.py generate-app-yaml.py

RUN apt-get -qqy update && \
    apt-get install -y python-yaml && \
    apt-get install -y nodejs
    
CMD python generate-app-yaml.py
