
# Imports ###########################################################

import os
import urlparse


# Functions #########################################################

def get_settings():
    settings = {}

    ## LMTPD config ##

    settings.update({
        'lmtpd_host': os.environ['LMTPD_HOST'],
        'lmtpd_port': int(os.environ['LMTPD_PORT']),
    })
    
    ## DB URL ##

    db_url = urlparse.urlparse(os.environ['MONGO_URL'])
    
    # Remove query strings.
    path = db_url.path[1:]
    path = path.split('?', 2)[0]

    settings.update({
        'db_name': path,
        'db_user': db_url.username,
        'db_password': db_url.password,
        'db_host': db_url.hostname,
        'db_port': db_url.port,
    })

    return settings


# Load settings #####################################################

settings = get_settings()

