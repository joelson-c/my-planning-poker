#!/bin/bash

source ~/.bashrc
cd /home/ec2-user/server
pm2 start "npm run start"
