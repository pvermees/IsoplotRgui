#!/bin/bash

home=${1:-"/home/pvermees/Documents/Programming/R"}

# build the image and upload the Docker Hub
docker build -t pvermees/isoplotr "$home/docker-isoplotr"
docker login
docker push pvermees/isoplotr
