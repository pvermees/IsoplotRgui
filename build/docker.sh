#!/bin/bash

home=${1:-"/home/pvermees/Documents/Programming/R"}

docker build -t pvermees/docker-isoplotr "$home/IsoplotR"
docker build -t pvermees/isoplotr "$home/IsoplotRgui"

#docker run -p 3838:80 pvermees/isoplotr
