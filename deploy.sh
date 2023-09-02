#!/bin/bash

aws deploy create-deployment --application-name my-plainit-poker \
    --deployment-config-name CodeDeployDefault.AllAtOnce \
    --deployment-group-name production \
    --description "Teste Deploy" \
    --github-location repository=joelson-c/my-planit-poker,commitId=$(git rev-parse HEAD) \
    --ignore-application-stop-failures
