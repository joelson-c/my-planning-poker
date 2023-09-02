#!/bin/bash

cd /home/ec2-user/my-planit-poker/server
pm2 start "npm run start"
