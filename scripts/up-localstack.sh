#!/usr/bin/env bash
set -e

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID="123456-localstack"
export AWS_SECRET_ACCESS_KEY="123456-localstack"

docker-compose -f ./test/integration/docker-compose.yml up -d

while [ "$( docker container inspect -f '{{.State.Status}}' localstack_main )" != "running" ]
do
    echo "${YELLOW}Waiting image localstack_main..."
    sleep 5
done

echo "${YELLOW}Creating resources"

sleep 5

sh ./scripts/create-resources.sh
