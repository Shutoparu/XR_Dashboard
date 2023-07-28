# Create new configs and certificates
source env\Script\activate
python misc\parse_config.py
.\misc\generate_cert.ps1

# Restart docker containers
docker restart OME_XR
docker restart Nginx_XR
docker restart Grafana_XR
docker restart Prometheus_XR