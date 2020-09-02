#!/bin/bash

home=${1:-"/home/pvermees/Documents/Programming/R"}

# create fresh docker-isoplotr directory
rm -rf "$home/docker-isoplotr"
mkdir "$home/docker-isoplotr"

# add all the IsoplotRgui files to the docker-isoplotr directory
cp -r "$home/IsoplotRgui/." "$home/docker-isoplotr"

# replace DESCRIPTION with a version that does not import IsoplotR
rm "$home/docker-isoplotr/DESCRIPTION"
cp "$home/IsoplotRgui/build/DESCRIPTION" "$home/docker-isoplotr"

# replace all references to IsoplotR from IsoplotRgui
sed -i 's/IsoplotR:://g' "$home/docker-isoplotr/inst/www/js/js2R.js"
sed -i 's/IsoplotR:://g' "$home/docker-isoplotr/R/server.R"
sed -i 's/IsoplotR:://g' "$home/docker-isoplotr/R/IsoplotR.R"

# copy all R files from IsoplotR to docker-isoplotr except IsoplotR.R
mkdir "$home/docker-isoplotr/temp"
cp -r "$home/IsoplotR/R/." "$home/docker-isoplotr/temp"
rm "$home/docker-isoplotr/temp/IsoplotR.R"
cp -r "$home/docker-isoplotr/temp/." "$home/docker-isoplotr/R/."
rm -rf "$home/docker-isoplotr/temp"

# copy all data files and documentation from IsoplotR to docker-isoplotr
# (the user will probably not use these files but it's good to be complete)
cp -r "$home/IsoplotR/inst/." "$home/docker-isoplotr/inst"
cp -r "$home/IsoplotR/man/." "$home/docker-isoplotr/man"
mkdir "$home/docker-isoplotr/data"
cp -r "$home/IsoplotR/data/." "$home/docker-isoplotr/data"

# combine the NAMESPACE files of IsoplotR and IsoplotRgui
cat "$home/IsoplotR/NAMESPACE" "$home/IsoplotRgui/NAMESPACE" > "$home/docker-isoplotr/NAMESPACE"

# move the Dockerfile to the docker-isoplotr home directory
mv "$home/docker-isoplotr/build/Dockerfile" "$home/docker-isoplotr/Dockerfile"
