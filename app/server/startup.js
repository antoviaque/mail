//
//  Copyright (C) 2012 Xavier Antoviaque <xavier@antoviaque.org>
//
//  This software's license gives you freedom; you can copy, convey,
//  propagate, redistribute and/or modify this program under the terms of
//  the GNU Affero General Public License (AGPL) as published by the Free
//  Software Foundation (FSF), either version 3 of the License, or (at your
//  option) any later version of the AGPL published by the FSF.
//
//  This program is distributed in the hope that it will be useful, but
//  WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
//  General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program in a file in the toplevel directory called
//  "AGPLv3".  If not, see <http://www.gnu.org/licenses/>.
//

// Functions /////////////////////////////////////////////////////////////

function headers_arrays2dict(headers) {
    var headers_dict = {};
    _.each(headers, function(header) {
        headers_dict[header[0].toLowerCase()] = header[1];
    });
    return headers_dict;
}

function get_header(mail, header_name){
    var result = null;
    if(mail.headers[header_name]) {
        result = mail.headers['message-id'];
    }
    return result;
}

function get_header_array(mail, header_name) {
    var result = [];
    if(mail.headers[header_name]) {
        var result = _.str.clean(mail.headers[header_name]);
        result = result.split(' ');
    }
    return result;
}

function get_references_plus_inreplyto(mail) {
    var message_id_regex = new RegExp(/(<[^<>@]+@[^<>@]+>)/);
    var references = mail.references;

    if(mail.headers['in-reply-to']) {
        var msgid = message_id_regex.exec(mail.headers['in-reply-to']);
        if(msgid && (!mail.references ||
                     (mail.references && _.last(mail.references) !== msgid[1]))) {
            references.push(msgid[1]);
        }
    }

    return references;
}        

function get_subject_type(mail) {
    var subject_type = 'new';

    if(mail.subject && mail.subject.search(/^Re:/i) === 0) {
        subject_type = 'reply';
    } else if(mail.subject && mail.subject.search(/^Fwd:/i) === 0) {
        subject_type = 'forward';
    }

    return subject_type;
}

function get_subject_clean(mail) {
    var subject = mail.subject;
    var regex = new RegExp(/^(Re|Fwd):/i);

    while(regex.exec(subject)) {
        subject = _.str.strRight(subject, ':');
        subject = _.str.ltrim(subject);
    }
    subject = _.str.clean(subject);

    return subject;
}

function process_level_1(mail) {
    // Headers
    mail.headers = headers_arrays2dict(mail.headers);

    // Threads
    mail.message_id = get_header(mail, 'message-id');
    mail.references = get_header_array(mail, 'references');
    mail.references = get_references_plus_inreplyto(mail);
    mail.subject_type = get_subject_type(mail);
    mail.subject_clean = get_subject_clean(mail);

    return mail;
}

function process_new_mails() {
    var max_processed_level = 1;

    Mails.find({$or: [
                    {processed_level: null}, 
                    {processed_level: {$lt: max_processed_level}}
                ]},
               {order: {received: 1}}).forEach(function(mail) {

        // Processed level - Used to re-process data on each release
        if(!mail.processed_level) {
            mail.processed_level = 0;
        }
        if(mail.processed_level < 1) {
            mail = process_level_1(mail);
        }

        // Record
        console.log('Processed '+mail.message_id+' - level '+ mail.processed_level + ' => ' + max_processed_level);
        mail.processed_level = max_processed_level;
        Fiber(function() {
            Mails.update({_id: mail._id}, mail);
        }).run();
    });

    Meteor.setTimeout(process_new_mails, 1000);
}


// Startup ///////////////////////////////////////////////////////////////

Meteor.startup(function () {
    process_new_mails();
});

