#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

cd "$SCRIPT_DIR/../../IsoplotR"
APP="$(/usr/bin/git rev-list master --count)"
APPVERSION=$APP

cd "$SCRIPT_DIR/.."
GUI="$(/usr/bin/git rev-list master --count)"
GUIVERSION=$GUI

s1="/"

COMMIT="$APPVERSION$s1$GUIVERSION"

FILE="$SCRIPT_DIR/../inst/www/version.txt"
echo -e "$COMMIT" > "$FILE"
