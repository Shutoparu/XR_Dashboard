# Uncomment the two lines to set up alias for python3.6 and openssl
# sal -Name python36 -Value path/to/python3.6.exe
# sal -Name openssl -Value path/to/openssl.exe

# Set up python venv using python 3.6
echo "setting up python venv"
python36 -m venv env
.\env\Scripts\activate
echo "installing python packages"
pip install -r requirements.txt

# Set up configs
if (-Not (Test-Path "ssl_pem" -PathType Container)) {
    echo "creating ssl_pem folder"
    mkdir ssl_pem
    echo "creating extfile.conf"
    New-Item -Path "ssl_pem\extfile.conf" -ItemType File
    $acl = Get-Acl "ssl_pem\extfile.conf"
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path "ssl_pem\extfile.conf" -AclObject $acl
}else{
    echo "ssl_pem already exists. skip creating ssl_pem folder"
}
if(-Not (Test-Path "configs\grafana_conf" -PathType Container)){
    echo "creating configs\grafana_conf folder"
    mkdir configs\grafana_conf
}else{
    echo "configs\grafana_conf already exists. skip creating configs\grafana_conf folder"
}
if(-Not (Test-Path "configs\nginx_conf" -PathType Container)){
    echo "creating configs\nginx_conf folder"
    mkdir configs\OME_conf
}else{
    echo "configs\nginx_conf already exists. skip creating configs\nginx_conf folder"
}
if(-Not (Test-Path "configs\OvenSpace_conf" -PathType Container)){
    echo "creating configs\OvenSpace_conf folder"
    mkdir configs\OME_conf
}else{
    echo "configs\OvenSpace_conf already exists. skip creating configs\OvenSpace_conf folder"
}
if(-Not (Test-Path "configs\prometheus_conf" -PathType Container)){
    echo "creating configs\prometheus_conf folder"
    mkdir configs\OME_conf
}else{
    echo "configs\prometheus_conf already exists. skip creating configs\prometheus_conf folder"
}
echo "parsing config..."
python misc\parse_config.py

# Set up certificates
if (-Not (Test-Path "ssl_pem\ca-key.pem" -PathType Leaf)) {
    echo "creating certificate autority (ca)"
    openssl genrsa -out "ssl_pem\ca-key.pem" 4096
    openssl req -new -x509 -sha256 -days 3650 -key "ssl_pem\ca-key.pem" -out "ssl_pem\ca.pem"
}else{
    echo "ca already exists. skip creating ca"
}
echo "creating server certificate"
.\misc\generate_cert_windows.ps1

# Set up docker containers if doesn't exist
echo "creating docker containers"
if (-Not (docker ps -aq -f name=OME_XR)) {
    echo "creating OME_XR"
    docker run -v .\configs\OME_conf\Server.xml:/opt/ovenmediaengine/bin/origin_conf/Server.xml -v .\ssl_pem:/etc/cert -p 3333:3333 -p 3334:3334 -p 3478:3478 -p 8081:8081 -p 8082:8082 -p 10000-10010:10000-10010/udp --name OME_XR -d airensoft/ovenmediaengine:dev
}
else {
    echo "OME_XR already exists. restarting OME_XR"
    docker restart OME_XR
}
if (-Not (docker ps -aq -f name=Nginx_XR)) {
    echo "creating Nginx_XR"
    docker run -v .\configs\nginx_conf\nginx.conf:/etc/nginx/conf.d/default.conf -v .\ssl_pem:/etc/nginx/cert -p 7777:80 -p 7778:443 --name Nginx_XR -d nginx
}
else {
    echo "Nginx_XR already exists. restarting Nginx_XR"
    docker restart Nginx_XR
}
if (-Not (docker ps -aq -f name=Grafana_XR)) {
    echo "creating Grafana_XR"
    docker run -v .\configs\grafana_conf\grafana.ini:/etc/grafana/grafana.ini -v .\ssl_pem:/etc/grafana/cert -p 3000:3000 --name Grafana_XR -d grafana/grafana-enterprise
}
else {
    echo "Grafana_XR already exists. restarting Grafana_XR"
    docker restart Grafana_XR
}
if (-Not (docker ps -aq -f name=Prometheus_XR)) {
    echo "creating Prometheus_XR"
    docker run -v .\configs\prometheus_conf\prometheus.yml:/etc/prometheus/prometheus.yml -p 9090:9090 --name Prometheus_XR -d prom/prometheus
}
else {
    echo "Prometheus_XR already exists. restarting Prometheus_XR"
    docker restart Prometheus_XR
}
