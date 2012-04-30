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
Session.set('current_conversation_id', null);


// Templates /////////////////////////////////////////////////////////////

Template.wall.conversations = function() {
    return Mails.find({}, {sort: {received: -1}});
};

Template.conversation_overview.selected = function() {
    if(Session.get('current_conversation_id') === this._id) {
        return 'selected';
    } else {
        return '';
    }
};

Template.conversation_details.conversation = function() {
    var mail = Mails.findOne({_id: Session.get('current_conversation_id')});
    if(mail) {
        mail.body_html = mail2html(mail);
    }
    return mail;
};


// Events ////////////////////////////////////////////////////////////////

Template.wall.events = {
    'click .conversation-overview' : function (evt) {
        var el = $(evt.target);
        if(!el.hasClass('conversation-overview')) {
            el = el.closest('.conversation-overview');
        }
        Session.set('current_conversation_id', el.attr('data'));
    }
};


// Startup ///////////////////////////////////////////////////////////////

Meteor.startup(function() {
    //$('.dateinput').datepicker();
    
});



