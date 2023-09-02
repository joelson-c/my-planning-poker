#!/bin/bash

source ~/.bashrc
cd /home/ec2-user/server
npm install --found=false --audit=false
npm run build
