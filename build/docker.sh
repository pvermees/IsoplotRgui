#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

docker build -t pvermees/docker-isoplotr "$SCRIPT_DIR/../../IsoplotR"
docker build -t pvermees/isoplotr "$SCRIPT_DIR/.."

# test by entering the following code at the command line:
# docker run -p 3839:80 pvermees/isoplotr
