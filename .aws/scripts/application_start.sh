#!/bin/bash

cd /home/ec2-user/app

docker compose -f docker-compose.production.yml up -d --build
