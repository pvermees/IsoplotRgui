#!/bin/bash

cd ~/Documents/Programming/R/IsoplotR/
APP="$(/usr/bin/git rev-list master --count)"
DIF="$(git rev-list --right-only --count origin/master...origin/beta)"
#APPVERSION=$(($APP+$DIF+1)) # comment out if deploying beta branch
APPVERSION=$APP # comment out if deploying master branch

cd ~/Documents/Programming/R/IsoplotRgui/
GUI="$(/usr/bin/git rev-list master --count)"
DIF="$(git rev-list --right-only --count origin/master...origin/beta)"
#GUIVERSION=$(($GUI+$DIF+1)) # comment out if deploying beta branch
GUIVERSION=$GUI # comment out if deploying master branch

s1="/"

COMMIT="$APPVERSION$s1$GUIVERSION"

FILE=inst/www/version.txt
echo -e "$COMMIT" > "$FILE"
