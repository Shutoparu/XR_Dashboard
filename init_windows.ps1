# Set up python venv using python 3.6
python36 -m venv env
.\env\Scripts/Activate.ps1
pip install -r requirements.txt

# Set up configs
if (-Not (Test-Path "ssl_pem" -PathType Container)) {
    mkdir ssl_pem
    New-Item -Path "ssl_pem\extfile.conf" -ItemType File
    attrib +R "ssl_pem\extfile.conf"
}
mkdir configs\grafana_conf
mkdir configs\nginx_conf
mkdir configs\OvenSpace_conf
python misc\parse_config.py

# Set up certificates
if (-Not (Test-Path "ssl_pem\ca-key.pem" -PathType Leaf)) {
    openssl genrsa -out "ssl_pem\ca-key.pem" 4096
    openssl req -new -x509 -sha256 -days 3650 -key "ssl_pem\ca-key.pem" -out "ssl_pem\ca.pem"
}
.\misc\generate_cert_windows.ps1

# Set up docker containers if doesn't exist
if (-Not (docker ps -aq -f name=OME_XR)) {
    docker run -v .\configs\OME_conf\Server.xml:/opt/ovenmediaengine/bin/origin_conf/Server.xml -v .\ssl_pem:/etc/cert -p 3333:3333 -p 3334:3334 -p 3478:3478 -p 8081:8081 -p 8082:8082 -p 10000-10010:10000-10010/udp --name OME_XR -d airensoft/ovenmediaengine:dev
}
else {
    docker start OME_XR
}
if (-Not (docker ps -aq -f name=Nginx_XR)) {
    docker run -v .\configs\nginx_conf\nginx.conf:/etc/nginx/conf.d/default.conf -v .\ssl_pem:/etc/nginx/cert -p 7777:80 -p 7778:443 --name Nginx_XR -d nginx
}
else {
    docker start Nginx_XR
}
if (-Not (docker ps -aq -f name=Grafana_XR)) {
    docker run -v .\configs\grafana_conf\grafana.ini:/etc/grafana/grafana.ini -v .\ssl_pem:/etc/grafana/cert -p 3000:3000 --name Grafana_XR -d grafana/grafana-enterprise
}
else {
    docker start Grafana_XR
}
if (-Not (docker ps -aq -f name=Prometheus_XR)) {
    docker run -v .\configs\prometheus_conf\prometheus.yml:/etc/prometheus/prometheus.yml -p 9090:9090 --name Prometheus_XR -d prom/prometheus
}
else {
    docker start Prometheus_XR
}
