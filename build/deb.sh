#!/bin/bash
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
dpkg-deb --root-owner-group --build "$SCRIPT_DIR/../isoplotr"
