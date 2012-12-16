#!/bin/bash

# Environment #######################################################

. "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/settings.sh"


# Main ##############################################################

"$BIN_DIR/meteor.sh" run -p $WEB_PORT $*
