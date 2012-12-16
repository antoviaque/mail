# Load this with `. ./bin/settings.sh`

# Settings ##########################################################

# Paths
BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$BIN_DIR/.."
METEOR_DIR="$BASE_DIR/meteor"
APP_DIR="$BASE_DIR/app"
LMTPD_DIR="$BASE_DIR/lmtpd"

# Web
WEB_PORT="4000"

# Database
MONGO_URL="mongodb://localhost/mail"

# LMTPD
LMTPD_HOST="127.0.0.1"
LMTPD_PORT="1111"

# Local overrides
touch "$BASE_DIR/local_settings.sh"
. "$BASE_DIR/local_settings.sh"

# Exports
export MONGO_URL
