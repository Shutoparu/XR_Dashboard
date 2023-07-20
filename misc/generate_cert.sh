#!/bin/bash

Host=$(cat ip.txt | grep Host | cut -d ' ' -f 2)

openssl genrsa -out ssl_pem/cert-key.pem 4096
openssl req -new -sha256 -subj "/CN=$Host" -key ssl_pem/cert-key.pem -out ssl_pem/cert.csr
openssl x509 -req -sha256 -days 3650 -in ssl_pem/cert.csr -CA ssl_pem/ca.pem -CAkey ssl_pem/ca-key.pem -out ssl_pem/cert.pem -extfile ssl_pem/extfile.conf -CAcreateserial
rm ssl_pem/cert.csr
cat ssl_pem/cert.pem ssl_pem/ca.pem > ssl_pem/chain.pem