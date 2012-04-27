#!/usr/bin/python

# Imports ###########################################################

import asyncore
import daemon

from pymongo import Connection
from pymongo.binary import Binary

from datetime import datetime
from smtpd import SMTPChannel, SMTPServer
from email import message_from_string


# Functions #########################################################

def parse_parts(msg):
    if not msg.is_multipart():
        result = {
            'is_multipart': False,
            'content_type': msg.get_content_type(),
            'filename': msg.get_filename(),
            'parameters': msg.get_params(),
            'charset': msg.get_charset(),
            'content': Binary(msg.get_payload(None, True)),
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

        self.mongo = Connection()
        self.db = self.mongo.mail

    def process_message(self, peer, mailfrom, rcpttos, data):
        msg = message_from_string(data)

        mail = {
            'envelope_from': mailfrom,
            'envelope_to': rcpttos,
            'received': datetime.utcnow(),
            'length': len(data),
            'source': data,
            'headers': msg.items(),
            'body': parse_parts(msg),
        }

        self.db.mails.insert(mail)

    def handle_accept(self):
        conn, addr = self.accept()
        channel = LMTPChannel(self, conn, addr)

class LMTPChannel(SMTPChannel):
    # LMTP "LHLO" command is routed to the SMTP/ESMTP command
    def smtp_LHLO(self, arg):
        self.smtp_HELO(arg)


# Main ##############################################################

def start():
    with daemon.DaemonContext():
        server = LMTPServer(('37.59.162.222', 1111), None)
        asyncore.loop()

if __name__ == '__main__':
    start()

