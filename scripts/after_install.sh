#!/bin/bash
cd /home/ec2-user/my-planit-poker
npm install --omit dev

npm run build --workspace server --workspace shared
