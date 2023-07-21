host = ''
ip = ''
with open('ip.txt','r', encoding="utf-8") as f:
    host = f.readline().strip().split(' ')[1]
    ip = f.readline().strip().split(' ')[1]
    f.close()

with open('config_template/grafana.ini', 'r', encoding="utf-8") as f:
    with open('configs/grafana_conf/grafana.ini', 'w', encoding="utf-8") as g:
        for line in f:
            if line.startswith('domain ='):
                new_line = 'domain = ' + host + '\n'
                g.write(new_line)
            else:
                g.write(line)
        g.close()
    f.close()

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

with open ('config_template/ovenspace.cfg','r', encoding="utf-8") as f:
    with open('configs/OvenSpace_conf/ovenspace.cfg','w', encoding="utf-8") as g:
        for line in f:
            if line.strip().split(' ')[0] == 'OME_HOST':
                new_line = 'OME_HOST = \'' + ip + '\'\n'
                g.write(new_line)
            else:
                g.write(line)
        g.close()
    f.close()

with open('ssl_pem/extfile.conf','w', encoding="utf-8") as f:
    f.write('subjectAltName = DNS:' + host + ',IP:' + ip + '\n')

