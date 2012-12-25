
# Imports ###########################################################

import uuid

from datetime import datetime
from email import message_from_string
from markdown2 import markdown
from pyzmail import PyzMessage


# Classes ###########################################################

class Mail:
    fields = [
            '_id',
            'body_html',
            'body_text',
            'envelope_sender',
            'envelope_to',
            'headers', 
            'message_id',
            'received',
            'recipients',
            'recipients_emails',
            'recipients_str',
            'references',
            'reply_type',
            'sender',
            'sender_email',
            'sender_str',
            'source',
            'subject',
            'to',
            'to_emails',
            'to_str',
        ]

    def __init__(self, peer, envelop_from, envelop_to, source):
        self._id = str(uuid.uuid4())
        
        self.source = source
        self.envelope_sender = envelop_from
        self.envelope_to = envelop_to
        self.received = datetime.utcnow()

        # email module
        self.mail_email = message_from_string(self.source)
        # pyzmail module
        self.mail_pyzmail = PyzMessage.factory(self.source)

    def to_python(self):
        obj = {}
        for fieldname in self.fields:
            obj[fieldname] = getattr(self, fieldname)
        return obj

    ## Fields ##

    @property
    def headers(self):
        headers = {}
        for name, value in self.mail_email.items():
            headers[name.lower()] = self.mail_pyzmail.get_decoded_header(name, default=None)
        return headers

    @property
    def message_id(self):
        return self.headers['message-id']

    @property
    def sender(self):
        return self.mail_pyzmail.get_address('from')
        
    @property
    def sender_email(self):
        return self.mail_pyzmail.get_address('from')[1]
        
    @property
    def sender_str(self):
        return self.sender[0]
        
    @property
    def to(self):
        return self.mail_pyzmail.get_addresses('to')

    @property
    def to_emails(self):
        return [email for name, email in self.mail_pyzmail.get_addresses('to')]
    
    @property
    def to_str(self):
        return ", ".join([name for name, email in self.to])

    @property
    def cc(self):
        return self.mail_pyzmail.get_addresses('cc')

    @property
    def cc_emails(self):
        return [email for name, email in self.mail_pyzmail.get_addresses('cc')]
    
    @property
    def cc_str(self):
        return ", ".join([name for name, email in self.cc])

    @property
    def recipients(self):
        return self.to + self.cc

    @property
    def recipients_emails(self):
        return self.to_emails + self.cc_emails

    @property
    def recipients_str(self):
        return self.to_str + self.cc_str        

    @property
    def body_html(self):
        body_html = self.get_part_content(self.mail_pyzmail.html_part)
        if body_html is None and self.body_text is not None:
            body_html = markdown(self.body_text)
        return body_html

    @property
    def body_text(self):
        return self.get_part_content(self.mail_pyzmail.text_part)


    def get_part_content(self, part):
        if not part:
            return None

        content = part.get_payload()
        if part.charset:
            content = content.decode(part.charset)
        return content

    @property
    def references(self):
        references = []

        if 'references' in self.headers:
            references += " ".split(self.headers['references'])
        
        # Add In-Reply-To header to references - cf http://www.jwz.org/doc/threading.html
        if 'in-reply-to' in self.headers and self.headers['in-reply-to']:
            # TODO
            #var message_id_regex = new RegExp(/(<[^<>@]+@[^<>@]+>)/);
            #var msgid = message_id_regex.exec(mail.headers['in-reply-to']);
            #if(msgid && (!mail.references || (mail.references && _.last(mail.references) !== msgid[1]))){
            #       references.push(msgid[1]);
            pass

        return references

    @property
    def reply_type(self):
        reply_type = 'new';

        # TODO
        #if(mail.subject && mail.subject.search(/^Re:/i) === 0) {
        #    subject_type = 'reply';
        #} else if(mail.subject && mail.subject.search(/^Fwd:/i) === 0) {
        #    subject_type = 'forward';

        return reply_type

    @property
    def subject(self):
        subject = self.mail_pyzmail.get_subject()
        
        # TODO
        #var regex = new RegExp(/^(Re|Fwd):/i);
        #while(regex.exec(subject)) {
        #    subject = _.str.strRight(subject, ':');
        #    subject = _.str.ltrim(subject);
        #}
        #subject = _.str.clean(subject);

        return subject

