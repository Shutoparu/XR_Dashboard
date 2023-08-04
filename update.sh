#!/bin/bash

# Create new configs and certificates
source env/bin/activate
python misc/parse_config.py
./misc/generate_cert.sh

# Restart docker containers
echo "restarting containers"
docker restart OME_XR
docker restart Nginx_XR
docker restart Grafana_XR
docker restart Prometheus_XR