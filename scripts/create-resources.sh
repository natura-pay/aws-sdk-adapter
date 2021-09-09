#!/usr/bin/env bash
set -e

YELLOW='\033[0;33m'
NC='\033[0m' # No Color


# Idempotency Table
echo "${YELLOW}Creating Table: test-dev${NC}"
aws dynamodb --endpoint-url=http://localhost:4566 create-table \
    --table-name test-dev \
    --attribute-definitions AttributeName=messageId,AttributeType=S \
    --key-schema AttributeName=messageId,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 | tee