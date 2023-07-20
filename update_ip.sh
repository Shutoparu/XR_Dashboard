#!/bin/bash
source env/bin/activate
python parse_config.py
./generate_cert.sh