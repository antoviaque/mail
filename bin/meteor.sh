#!/bin/bash

# Environment #######################################################

. "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/settings.sh"


# Main ##############################################################

echo "MONGO_URL=$MONGO_URL"

cd "$APP_DIR"
"$METEOR_DIR/meteor" $*

