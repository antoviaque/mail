//
//  Copyright (C) 2012-2013 Xavier Antoviaque <xavier@antoviaque.org>
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
    return Mails.findOne({_id: Session.get('conversation_current_id')});
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


