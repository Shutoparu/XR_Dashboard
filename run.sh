#!/bin/bash
source env/bin/activate
./stop.sh
nohup gunicorn --bind 0.0.0.0:5000 --worker-class eventlet -w 1 --threads 1 OvenSpace:app > OvenSpace.log 2>&1 & 
