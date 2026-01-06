#!/bin/bash

cp ./schema.graphql /subgraphs/users.graphql
uvicorn main:app --host 0.0.0.0 --port 80 --log-config config/uvicorn_config.json
