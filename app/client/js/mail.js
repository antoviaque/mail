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

// DB Collections ////////////////////////////////////////////////////////

Mails = new Meteor.Collection("mails");
Meteor.subscribe('mails');


// Session variables /////////////////////////////////////////////////////

// Timezone
Session.set('timezone', jstz.determine_timezone());

// Current conversation
Session.set('conversation_current_id', null);
Session.set('conversation_replying', false);


// Functions /////////////////////////////////////////////////////////////

function close_reply() {
    var html_editor = CKEDITOR.instances.html_editor;
    if(html_editor) {
        html_editor.destroy();
    }
    Session.set('conversation_replying', false);
}


// Templates /////////////////////////////////////////////////////////////

// Conversations //

Template.wall.conversations = function() {
    return Mails.find({}, {sort: {received: -1}});
};

// Conversation overview //

Template.conversation_overview.selected = function() {
    if(Session.get('conversation_current_id') === this._id) {
        return 'selected';
    }
    return '';
};

// Conversation details //

Template.conversation_details.conversation = function() {
    var mail = Mails.findOne({_id: Session.get('conversation_current_id')});
    if(mail) {
        mail.body_html = mail2html(mail);
    }
    return mail;
};

Template.conversation_details.conversation_replying = function() {
    return Session.get('conversation_replying');
};

Template.conversation_details.activate_editor = function() {
    Meteor.defer(function() {
        CKEDITOR.replace('html_editor', {
            toolbar: [ 
                ['Bold','Italic','Underline','Strike','-','TextColor','BGColor','-','RemoveFormat'],
                ['NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote'],
                ['Find','Replace','-','SelectAll'],
                ['Undo','Redo'],
                ['Format','Font','FontSize'],
                ['Link','Unlink','-','Image','Table','HorizontalRule','Smiley','SpecialChar'],
                ['Maximize'],
            ],
        });
    });
};

Template.conversation_details.reply_base_html = function() {
    var mail = Template.conversation_details.conversation();
    var reply_base_html = '<p></p>' +
        '<p>' + mail.from + ' wrote:</p>' +
        '<blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">' +
        mail.body_html +
        '</blockquote>';
    return reply_base_html;
};


// Events ////////////////////////////////////////////////////////////////

// Wall //

Template.wall.events = {
    'click .email-excerpt' : function (evt) {
        var el = $(evt.target);
        if(!el.hasClass('email-excerpt')) {
            el = el.closest('.email-excerpt');
        }
        close_reply();
        Session.set('conversation_current_id', el.attr('data'));
    },
};

// Conversation details //

Template.conversation_details.events = {
    'click .reply-button': function(evt) {
        Session.set('conversation_replying', true);
    },
    'click .cancel-button': function(evt) {
        close_reply();
    },
    'click .send-button': function(evt) {
        var orig_mail = Template.conversation_details.conversation();
        var html_editor = CKEDITOR.instances.html_editor;
        var reply_html = html_editor.getData();

        var mail = {
            to : orig_mail.from,
            from : 'test@maildev.plebia.org',
            subject : 'Re: ' + orig_mail.subject,
            html: reply_html,
        };
        Meteor.call('sendmail', mail);
        close_reply();
    },
};


// Startup ///////////////////////////////////////////////////////////////

Meteor.startup(function() {
    //$('.dateinput').datepicker();
});



