import configparser
import yaml

config = configparser.ConfigParser()
config.read('config.cfg', encoding="utf-8")

host = config['HOST.IP']['DNS_Hostname']
ip = config['HOST.IP']['IP_Address']

edge_ip = {} # 1-indexed

for i in range(1,9):
    edge_ip[str(i)] = config['EDGE.IP']['EDGE_'+str(i)]

exporters = {}

exporters['NVIDIA'] = config['EDGE.SCRAPE.PORT']['NVIDIA_exporter']
exporters['ping_exporter'] = config['EDGE.SCRAPE.PORT']['ping_exporter']
exporters['windows_exporter'] = config['EDGE.SCRAPE.PORT']['windows_exporter']

dashboard_settings = dict(config['DASHBOARD.DISPLAY'])

#  Set config for Grafana
config_grafana = configparser.ConfigParser()
config_grafana.read('config_template/grafana.ini', encoding="utf-8")
config_grafana['server']['domain'] = host
with open('configs/grafana_conf/grafana.ini', 'w', encoding="utf-8") as f:
    config_grafana.write(f)
    f.close()

# Set config for Nginx
with open('config_template/nginx.conf','r', encoding="utf-8") as f:
    with open('configs/nginx_conf/nginx.conf','w', encoding="utf-8") as g:
        for line in f:
            if line.strip().split(' ')[0] == 'server_name':
                new_line = '  server_name ' + host + ';\n' 
                g.write(new_line)
            elif line.strip().split(' ')[0] == 'rewrite':
                new_line = '  rewrite ^(.*)$ https://' + ip + '$1 permanent;\n'
                g.write(new_line)
            else:
                g.write(line)
        g.close()
    f.close()

# Set config for OvenSpace
with open('config_template/ovenspace.cfg','r', encoding="utf-8") as f:
    with open('configs/OvenSpace_conf/ovenspace.cfg','w', encoding="utf-8") as g:
        for line in f:
            if line.strip().split(' ')[0] == 'OME_HOST':
                new_line = 'OME_HOST = "' + ip + '"\n' 
                g.write(new_line)
            else:
                g.write(line)
        for k in dashboard_settings.keys():
            new_line = k.upper() + ' = "' + dashboard_settings[k] + '"\n'
            g.write(new_line)
        g.close()
    f.close()

# Set config for OpenSSL
with open('ssl_pem/extfile.conf','w', encoding="utf-8") as f:
    f.write('subjectAltName = DNS:' + host + ',IP:' + ip + '\n')
    f.close()

# Set config for Prometheus

with open('config_template/prometheus.yml', 'r', encoding='utf-8') as f:
    prom_conf = yaml.safe_load(f)
    for job in prom_conf['scrape_configs']:
        if job['job_name'] == "prometheus":
            pass
        else:
            job['static_configs'][0]['targets'][0] = (edge_ip[job['job_name'][-1]] + ":" + exporters[job['job_name'][:-1]])
    with open('configs/prometheus_conf/prometheus.yml', 'w', encoding='utf-8') as g:
        yaml.dump(prom_conf, g)
        g.close()
    f.close()