#!/bin/bash

npx rover supergraph compose --skip-update --config ./composer/supergraph.yml > supergraph.graphql \
    && npm start
