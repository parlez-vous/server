"""
Dynamically adds environment variables to the app.yaml file
"""

import yaml
import os

# This is the base app.yaml file which gets
# environment variables dynamically injected
# at build time (for staging / prod)
app_yaml_base = """
  runtime: nodejs10
  env: standard
  instance_class: B1
  service: default
  basic_scaling:
    max_instances: 1
    idle_timeout: 10m
  env_variables:
    NODE_PATH: "./build"
"""

# convert raw yaml string into a dict
obj = yaml.safe_load(app_yaml_base)

# dynamically add sensitive environment variables
obj['env_variables'].update({
  "CRON_INTERVAL_MS": os.environ['CRON_INTERVAL_MS'],
  "PRISMA_ENDPOINT": os.environ['PRISMA_ENDPOINT']
})

print(yaml.dump(obj, default_flow_style=False))
