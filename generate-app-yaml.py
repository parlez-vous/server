"""
Dynamically adds environment variables to the app.yaml file
"""

import yaml
import os

# This is the base app.yaml file which gets
# environment variables dynamically injected
# at build time (for staging / prod)
app_yaml_base = """
  runtime: custom
  env: flex
  manual_scaling:
    instances: 1
  env_variables:
    NODE_PATH: "./build"
"""

# convert raw yaml string into a dict
obj = yaml.load(app_yaml_base)


cloud_sql_instances = os.environ['CLOUD_SQL_INSTANCES']

# dynamically add sensitive environment variables
obj['env_variables'].update({
  "DATABASE_HOST": "/cloudsql/" + cloud_sql_instances,
  "DATABASE_USER": os.environ['DATABASE_USER'],
  "DATABASE_PASSWORD": os.environ['DATABASE_PASSWORD'],
  "DATABASE_NAME": os.environ['DATABASE_NAME'],
  "CRON_INTERVAL_MS": os.environ['CRON_INTERVAL_MS']
})

obj['beta_settings'] = {
  "cloud_sql_instances": cloud_sql_instances
}

print(yaml.dump(obj, default_flow_style=False))
