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

        return false;
    },
};

// Conversation details //

Template.conversation_details.events = {
    'click .do-reply': function(evt) {
        Session.set('conversation_replying', true);
        return false;
    },
    'click .cancel-button': function(evt) {
        close_reply();
        return false;
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
        
        return false;
    },
};

// Reply buttons //

// TODO: Migrate to template event
$(document).ready(function(){

	$(".do-reply, .do-reply-all").click(function () {
		$("#reply-wrap").toggle();
	});

});
