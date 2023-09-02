#!/bin/bash

cd /home/ec2-user/server
npm install --found=false --audit=false
npm run build
