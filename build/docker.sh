#!/bin/bash

home=${1:-"/home/pvermees/Documents/Programming/R"}

##docker rmi --no-prune pvermees/isoplotr
#docker build --no-cache -t pvermees/docker-isoplotr "$home/IsoplotR"
#docker build --no-cache -t pvermees/isoplotr "$home/IsoplotRgui"

docker build -t pvermees/docker-isoplotr "$home/IsoplotR"
docker build -t pvermees/isoplotr "$home/IsoplotRgui"

# test by entering the following code at the command line:
# docker run -p 3838:80 pvermees/isoplotr
