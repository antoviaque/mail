#!/bin/bash -e

# Environment #######################################################

. "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/settings.sh"


# Main ##############################################################

# Cloning
if [ ! -d "$METEOR_DIR" ]; then
    cd "$BASE_DIR"
    git clone -b plebia https://github.com/antoviaque/meteor.git
fi

# Updating meteor
cd "$METEOR_DIR"
git checkout plebia
git pull origin plebia

# Updating meteor dev bundle
cd "$APP_DIR"
"$METEOR_DIR/meteor" --version

# Extra node dependencies
cd "$METEOR_DIR/dev_bundle/lib"
npm install nodemailer

