# XR Dashboard
## Introduction
This is a web server that displays the status of XR devices. It is designed to be used with Prometheus and Grafana.
The webpage is based on open source project [OvenSpace](https://github.com/airensoft/ovenspace).

## Prerequisits
1. Python 3.6
2. OpenSSL
3. Docker

## Install and Initialize
1. Clone this repository
   ```
   $ git clone https://github.com/Shutoparu/XR_Dashboard.git
   ```
2. In [ip.txt](./ip.txt), set hostname and ip address. Remeber to add a space after colon.
3. [Set up exporters](#set-up-exporters).
4. [Configure Prometheus](#configure-prometheus).
5. Run [init.sh](./init.sh) to set up environment. Fill in necessary information. (Only need to run once)
   ```
   $ ./init.sh
   ```
6.  Add the generated CA to trusted CA list to your browser. [method1](https://blog.miniasp.com/post/2019/02/25/Creating-Self-signed-Certificate-using-OpenSSL) [method2](https://github.com/ChristianLempa/cheat-sheets/blob/main/misc/ssl-certs.md)
7. [Create Grafana panels](#configure-grafana-panels).
8. Run [run.sh] to boot up web server. To stop, run [stop.sh](./stop.sh)
   ```
   $ ./run.sh
   $ ./stop.sh
   ```
9.  You should see the web server running on https://your.ip.address:5000

### To change IP address and/or host name:
1. Change [ip.txt](./ip.txt)
2. run [update_ip.sh](./update_ip.sh)
   ```
   $ ./update_ip.sh
   ```
3. Restart web server
   ```
   $ ./run.sh
   ```
## Set up Exporters
Waiting to be written

## Configure Prometheus
Waiting to be written

## Create Grafana Panels
1. go to https://your.ip.address:3000 on your broser.
2. Login with username: admin, password: admin
   (Optional: change your password)
3. From the navagate bar on the left, go to Connections -> Data Sources -> Add new connection
4. Search for "Prometheus", select it, and click "Create a Prometheus data source"
5. In "Prometheus server URL" section, put https://host.internal.docker:9090 (host.internal.docker is the hostname of the docker container)
6. Click "Save & Test". If it says "Data source is working", then you are good to go.
7. Other Stuff...


note: download py3.6.8 and openssl on windows
1. donwload
2. locate path to .exe
3. gal -Name alias-name -Value path/to/.exe
4. in "$Home\Documents" add file "profile.ps1" and add line 3 (for user)
5. if add in in "$PsHome", then for all users (admin)
6. change execution policy to bypass (set-executionpolicy bypass)
7. restart powershell
8. 