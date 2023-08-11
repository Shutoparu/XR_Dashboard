# Create new configs and certificates
.\env\Scripts\activate
python misc\parse_config.py
.\misc\generate_cert.ps1

# Restart docker containers
echo "restarting containers"
docker restart OME_XR
docker restart Nginx_XR
docker restart Grafana_XR
docker restart Prometheus_XR