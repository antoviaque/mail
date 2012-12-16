# Load this with `. ./bin/settings.sh`

# Settings ##########################################################

# Paths
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$DIR/.."
METEOR_DIR="$BASE_DIR/meteor"
APP_DIR="$BASE_DIR/app"

# Database
MONGO_URL=mongodb://localhost/mail

# Local overrides
touch "$BASE_DIR/local_settings.sh"
. "$BASE_DIR/local_settings.sh"

# Exports
export MONGO_URL
