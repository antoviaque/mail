#!/usr/bin/python

# Imports ###########################################################

import asyncore
import daemon
import os
import urlparse
import uuid

from pymongo import Connection

from datetime import datetime
from smtpd import SMTPChannel, SMTPServer
from email import message_from_string


# Functions #########################################################

def get_settings():
    settings = {}

    ## DB URL ##

    db_url = urlparse.urlparse(os.environ.get('MONGO_URL'))
    
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

def valid_utf8(text):
    if text is None:
        return None
    return text.decode('utf-8', 'replace').encode('utf-8')

def parse_parts(msg):
    if not msg.is_multipart():
        if msg.get_content_maintype() == 'text':
            content = valid_utf8(msg.get_payload(None, True))
        else:
            # TODO Save non-text attachments
            content = ''

        result = {
            'is_multipart': False,
            'content_type': valid_utf8(msg.get_content_type()),
            'filename': valid_utf8(msg.get_filename()),
            'parameters': msg.get_params(),
            'charset': valid_utf8(msg.get_charset()),
            'content': content,
        }
    else:
        result = {
            'is_multipart': True,
            'params': msg.get_params(),
            'parts': [],
        }

        for part in msg.get_payload():
            child = parse_parts(part)
            result['parts'].append(child)

    return result


# Classes ###########################################################

class LMTPServer(SMTPServer):
    def __init__(self, localaddr, remoteaddr):
        SMTPServer.__init__(self, localaddr, remoteaddr)

        self.db_connect()

    def db_connect(self):
        settings = get_settings()

        self.mongo = Connection('{0}:{1}'.format(settings.db_host, settings.db_port))
        self.db = self.mongo[settings.db_name]
        if settings.db_user and settings.db_password:
            self.db.authenticate(settings.db_user, settings.db_password)

    def process_message(self, peer, mailfrom, rcpttos, data):
        msg = message_from_string(data)

        mail = {
            '_id': str(uuid.uuid4()),
            'envelope_from': mailfrom,
            'envelope_to': rcpttos,
            'length': str(len(data)),
            'body': parse_parts(msg),
            'source': valid_utf8(data),
            'headers': msg.items(),
            'from': valid_utf8(msg['from']),
            'to': valid_utf8(msg['to']),
            'subject': valid_utf8(msg['subject']),
            'received': datetime.utcnow(),
        }

        self.db.mails.insert(mail)

    def handle_accept(self):
        conn, addr = self.accept()
        LMTPChannel(self, conn, addr)

class LMTPChannel(SMTPChannel):
    # LMTP "LHLO" command is routed to the SMTP/ESMTP command
    def smtp_LHLO(self, arg):
        self.smtp_HELO(arg)


# Main ##############################################################

def start():
    with daemon.DaemonContext():
        LMTPServer(('127.0.0.1', 1111), None)
        asyncore.loop()

if __name__ == '__main__':
    start()

