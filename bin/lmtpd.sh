#!/bin/bash

# Environment #######################################################

. "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/settings.sh"


# Main ##############################################################

"$LMTPD_DIR/lmtpd.py"

