Mail
====

A proof of concept for a webmail client with Meteor. Only some of the features have been implemented, and there is no security. Use at your own risk!

Install
=======

SMTP Server
-----------

Mail doesn't attempt to reinvent the wheel, and relies on a SMTP server for sending and receiving emails. You will need to have a working mail configuration first. Postfix is recommended - see for example the [Debian Postfix HOWTO][].

See also the _Incoming emails_ section below, to feed incoming emails into Mail.

Installation
------------

### Installation

Clone the source repository:

    $ git clone git://github.com/antoviaque/mail.git
    $ cd mail

### Dependencies

Install python dependencies:

    $ sudo pip install -r requirements

And the following packages (Debian-based systems):

    $ sudo apt-get install python-daemon mongodb python-pymongo mongodb-clients mongodb-server curl

[Install node.js][]:

    $ sudo apt-get install python g++ make
    $ mkdir ~/nodejs && cd $_
    $ wget -N http://nodejs.org/dist/node-latest.tar.gz
    $ tar xzvf node-latest.tar.gz && cd `ls -rd node-v*`
    $ ./configure
    $ make
    $ sudo make install

Install npm:

    $ curl http://npmjs.org/install.sh | sudo sh

### Configuration (optional)

Edit the configuration if you want to change one of the default values:

    $ cp local_settings.sh.example local_settings.sh
    $ gvim local_settings.sh

See `local_settings.sh.example` to get a list of the available configuration variables are available, with their default values.

### Running

Run the server:

    $ make run

It will also get meteor and its dependencies.

Mail should now be accessible, by pointing your browser to http://localhost:4000/

Incoming emails
---------------

Mail receives incoming emails from the SMTP server through the LMTP protocol, a subset of the SMTP protocol.

First, start the LMTP daemon:

    $ cd /path/to/mail/
    $ make run-lmtpd

Now, you need to configure your SMTP server, to get him to deliver the incoming emails to Mail rather than on a local mailbox. The examples below are for Postfix, but you should be able to use any mailer able to forward to an LMTP server.

### Example: Postfix (with `virtual_transport`)

For example with Postfix, add the following to `/etc/postfix/main.cf`:

    virtual_transport = lmtp:127.0.0.1:1111
    virtual_mailbox_domains = maildev.plebia.org

Then reload postfix:

    $ sudo service postfix reload

This will feed emails addressed to any address like @maildev.plebia.org to Mail, by feeding them through the LMTPD server, running on `127.0.0.1` on port `1111`.

Also, make sure the domain name(s) you use for `virtual_mailbox_domains` aren't in `mydestination = ` in `main.cf`.

### Example: Postfix (with `transport_maps`)

Using `virtual_transport` is the easiest option, but sometimes you want to be able to define different transports for different domains. In that case, you can add the following to `main.cf`:

    transport_maps = hash:/etc/postfix/transport

Then add the following line to `/etc/postfix/transport`:

    maildev.plebia.org    lmtp:127.0.0.1:1111

Then compile the `transport` file and reload postfix:

    $ postmap /etc/postfix/transport
    $ sudo service postfix reload

Development mode
----------------

If you would like to start the Meteor server in development mode:

    $ make dev

If it refuses to start with the following message `throw errnoException(errno, 'watch');`, you need to increase the number of allowed instances from inotify (Linux):

    # echo 8192 > /proc/sys/fs/inotify/max_user_instances

Licenses
--------

### Code

Copyright (C) 2012 Xavier Antoviaque <xavier@antoviaque.org>

This software's license gives you freedom; you can copy, convey,
propagate, redistribute and/or modify this program under the terms of
the GNU Affero General Public License (AGPL) as published by the Free
Software Foundation (FSF), either version 3 of the License, or (at your
option) any later version of the AGPL published by the FSF.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program in a file in the toplevel directory called
"AGPLv3".  If not, see <http://www.gnu.org/licenses/>.

### Design

Copyright (C) 2012 Tobias van Schneider http://www.vanschneider.com/work/mail/

Creative Commons Attribution-ShareAlike 3.0 Unported License

See `LICENSE.CC-BY-SA-3.0`


[Debian Postfix HOWTO]:     http://wiki.debian.org/Postfix
[Install node.js]:          https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
