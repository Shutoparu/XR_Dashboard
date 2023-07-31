# XR Dashboard
## Introduction
This is a web server that displays the status of XR devices. It is designed to be used with Prometheus and Grafana.
The webpage is based on open source project [OvenSpace](https://github.com/airensoft/ovenspace).

## Prerequisits
1. Python 3.6 [Download](https://www.python.org/downloads/release/python-368/)
2. OpenSSL [Download](https://slproweb.com/products/Win32OpenSSL.html)
3. Docker [Download](https://www.docker.com/products/docker-desktop/)

## Before starting

1.  All the shell scripts you see below has a corresponding powershell script for windows. If you are using windows, use the powershell script instead. (e.g. `init.sh` -> `init.ps1`)
1. For Windows, we assume you have set up alias for both python3.6 and openssl. In the following scripts, we use the names `python36` and `openssl`. If you don't have the alias set up, please refer to [this](#set-up-alias-for-python-and-openssl-on-windows).

## Install and Initialize

1. Clone this repository
   ```
   $ git clone https://github.com/Shutoparu/XR_Dashboard.git
   ```
2. In `ip.txt`, set hostname and ip address. Remeber to add a space after colon. For example:
   ```
   DNS/Hostname: hsnu-ap
   IP_address: 192.168.4.240
   ```
3. [Set up exporters](#set-up-exporters-on-edge-servers).
4. [Configure Prometheus](#configure-prometheus).
5. Run `init.sh` to set up environment. Fill in necessary information. (Only need to run once)
   ```
   $ ./init.sh
   ```
   What the script does (in order):
   - Create a Python 3.6 virtual environment
   - Install required packages
   - Create config files for Grafana, Prometheus, Nginx, XR Dashboard and SSL certificate.
   - Generate a Self signed CA certificate, if not yet created.
     - OpenSSL will prompt you to fill in the following information. Here is an example of what you should fill in:
       - Country Name (2 letter code) [AU]: TW
       - State or Province Name (full name) [Some-State]: Taiwan
       - Locality Name (eg, city) []: Taipei
       - Organization Name (eg, company) [Internet Widgits Pty Ltd]: Compal Electronics, Inc.
       - Organizational Unit name (eg, section) []: XR_Cube
       - Common Name (e.g. server FQDN or YOUR name) []: XR_Cube
       - Email Address []: your.email@email.com
     - If you already have a CA certificate, put it in `certs` folder and name it `ca.pem`. Also, put the corresponding private key in `certs` folder and name it `ca-key.pem`.
   - Generate a Self signed SSL certificate for development based with the given IP address.
   - Initialize docker containers for Grafana, Prometheus, Nginx, and OvenMediaEngine, if they are not yet initialized.
6.  Add the generated CA to trusted CA list to your machine. [How to add CA to trusted CA list](#add-ca-to-trusted-ca-list).
7. [Set up Grafana](#set-up-grafana).
8. Run `run.sh` to boot up web server. To stop, run `stop.sh`
   ```
   $ ./run.sh
   $ ./stop.sh
   ```
   - The script uses gunicorn to put the process in background. stdout and stderr will be redirected to `OvenSpace.log`
9. You should see the web server running on `https://your.ip.address:7778`

### To change IP address and/or host name:
1. Update `ip.txt`
2. Run `update_ip.sh`
   ```
   $ ./update_ip.sh
   ```
   - The script will update all IP and hostname related section in all config files, and restart all docker containers.
3. Restart web server with `run.sh`
   ```
   $ ./run.sh
   ```

---

## Set up exporters (On edge servers)
Construction in progress...
<!-- 
- Nvidia Gpu Exporter
    - run the `nvidia_gpu_exporter.exe`
    - Default port: 9835
- ping_exporter
    
    [prometheus的网络ping监控exporter_姚__的博客-CSDN博客](https://blog.csdn.net/qq_32969313/article/details/124878153)
    
    - run command: `main.exe -port 8888 -pingaddr yourIP -count 4`
        - fill the target IP address in. What addr?
    - Default port: 8888
- windows_exporter
    - run the`windows_exporter.exe`
    - Default port: 9182 -->

## Configure Prometheus

###### Make sure to configure Prometheus before running `init.sh`. If config is changed after the Prometheus Docker container is run, make sure to restart the container.
    
In `configs/prometheus_conf/prometheus.yml`, you will see the following. Fill in the addresses and ports of the exporters you want to scrape.

```yml
global: # global config, not related to scraping
  scrape_interval:     15s
  evaluation_interval: 15s

rule_files: # add more rule files here if needed
  # - "first.rules"
  # - "second.rules"

scrape_configs: # add scrape jobs here
# Example
# - job_name: Name of the job
#   static_configs:
#     - targets: ['ip.address.to.scrape:port']

  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']

  - job_name: NVIDIA1
    static_configs:
      # replace this address with actual address and port of the edge server
      - targets: ['192.168.4.167:9835']

  - job_name: windows_exporter1
    static_configs:
      # replace this address with actual address and port of the edge server
      - targets: ['192.168.4.167:9182']

  - job_name: ping_exporter1
    static_configs:
      # replace this address with actual address and port of the edge server
      - targets: ['192.168.4.167:8888']

# more jobs can be added.

```

After finishing the configuration and initialization with `init.sh`, you should see it running on `http://your.ip.address:9090`

---

## Set up Grafana

Make sure the `init.sh` script is run. If config is changed after the Grafana Docker container is run, make sure to restart the container.

### Access Grafana
Visit `https://your.ip.address:3000` to access Grafana. 

Click Sign in on top right of the screen. Log in with the default username and password `admin`. You will be asked to change your password after logging in for the first time (skip recommended).
 
### Add data source
    
1. Open the navigation panel on top left of the screen (three stripes).
2. Click `Connection -> Add new connection` and search for `Prometheus`.
3. Click on `Prometheus` and click `Create a Prometheus data source`.
4. Give the data source a name, e.g. `Prometheus_XR`.
5. In the `Prometheus server URL` section, enter `http://host.docker.internal:9090` and hit `Save & Test`.

### Import Dashboard

1. Click the `+` button on top right of the page -> `Import Dashboard`
2. Upload `XR_CUBE.json` to the page.
3. Select the newly created Prometheus data source (e.g. `Prometheus_XR`) and click `Import`.

---

## Add CA to trusted CA list
- Windows: 
  1. Open `certmgr.msc` with run ( Win+R ).
  2. Right click on `Trusted Root Certification Authorities` -> `All Tasks` -> `Import...`
  3. Locate and import the generated CA certificate `ca.pem`.
  4. Click `Next` and `Finish`.

- Android: (The exact steps vary device-to-device, but here is a generalised guide:)

  1. Open Phone Settings
  2. Locate Encryption and Credentials section. It is generally found under Settings > Security > Encryption and Credentials
  3. Choose Install a certificate
  4. Choose CA Certificate
  5. Locate the certificate file ca.pem on your SD Card/Internal Storage using the file manager.
  6. Select to load it.
  7. Done!

---

## Set up alias for python and openssl on windows
Here, we provide two methods for you to choose from.
##### 1. Create a file named `profile.ps1` to be run everytime when powersehll is run
1. Open powershell as admin
2. Create a file named `profile.ps1` in `$Home\Documents\WindowsPowerShell`. This will only affect the current user.
   ```
   $ New-Item -Path $Home\Documents\WindowsPowerShell -Name profile.ps1 -ItemType file
   ```
   Or create a file named `profile.ps1` in `$PsHome` if you want to affect all users.
   ```
    $ New-Item -Path $PsHome -Name profile.ps1 -ItemType file
    ```

3. Open the file with notepad
   ```
    $ notepad $Home\Documents\WindowsPowerShell\profile.ps1
    ```
    or
    ```
    $ notepad $PsHome\profile.ps1
    ```
4. Add the following line to the file
   ```
   sal -Name python36 -Value path/to/python3.6.exe
   sal -Name openssl -Value path/to/openssl.exe
   ```
5. Save and close the file
6. Restart powershell
   
##### 2. Uncomment the following lines in `init.ps1` and `.\misc\generate_cert.ps1` run it as admin
   1. Open powershell as admin
   2. Uncomment and modify the following lines in `init.ps1`
      ```
      sal -Name python36 -Value path/to/python3.6.exe
      sal -Name openssl -Value path/to/openssl.exe
      ```
   3. Uncomment and modify the following line in `.\misc\generate_cert.ps1`
      ```
      sal -Name openssl -Value path/to/openssl.exe
      ```
  


<!-- 
## some notes that still need to be organized
note: download py3.6.8 and openssl on windows
1. donwload
2. locate path to .exe
3. sal -Name alias-name -Value path/to/.exe
4. in "$Home\Documents" add file "profile.ps1" and add line 3 (for user)
5. if add in in "$PsHome", then for all users (admin)
6. change execution policy to bypass (set-executionpolicy bypass)
7. restart powershell

https://github.com/utkuozdemir/nvidia_gpu_exporter/issues/7 -->