#!/usr/bin/python

# Imports ###########################################################

import asyncore
import daemon

from pymongo import Connection
from smtpd import SMTPChannel, SMTPServer

from config import settings
from mail import Mail


# Classes ###########################################################

class LMTPServer(SMTPServer):
    def __init__(self):
        localaddr = (settings['lmtpd_host'], settings['lmtpd_port'])
        SMTPServer.__init__(self, localaddr, None)

        self.db_connect()

    def db_connect(self):
        self.mongo = Connection('{0}:{1}'.format(settings['db_host'], settings['db_port']))
        self.db = self.mongo[settings['db_name']]
        if settings['db_user'] and settings['db_password']:
            self.db.authenticate(settings['db_user'], settings['db_password'])

    def process_message(self, peer, mailfrom, rcpttos, payload):
        mail = Mail(peer, mailfrom, rcpttos, payload)
        self.db.mails.insert(mail.to_python())
        
        # TODO: Threads - cf http://www.jwz.org/doc/threading.html

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
        LMTPServer()
        asyncore.loop()

if __name__ == '__main__':
    start()

