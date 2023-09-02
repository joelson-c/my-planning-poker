#!/bin/bash
export BASE_DIR="/home/ec2-user/my-planit-poker"

cd ${BASE_DIR}/shared
npm install --found=false --audit=false

cd ${BASE_DIR}/server
npm install --found=false --audit=false
npm run build
