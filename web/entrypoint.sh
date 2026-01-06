#!/bin/bash

# Create a symbolic link to the node_modules directory in the cache directory
ln -s /cache/node_modules /web/node_modules

# Execute the container's main process
exec "$@"