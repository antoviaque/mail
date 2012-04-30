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

// Formatting ///////////////////////////////////////////////////////

function urlize(text) {
    var list = text.match(/\b(http:\/\/|www\.|http:\/\/www\.)[^ \n\r<]{2,200}\b/g);
    if(list) {
        for(i = 0; i < list.length; i++) {
            var prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
            text = text.replace( list[i], "<a target='_blank' href='" + prot + list[i] + "'>"+ list[i] + "</a>" );
        }
    }
    return text;
}

function text2html(text) {
    var converter = new Showdown.converter();
    var html = converter.makeHtml(text);
    html = urlize(html);
    return html;
}

function mail2html(mail) {
    var body = mail.body;
    var html = '';

    if(!body.is_multipart) {
        html = text2html(body.content);
    } else if(body.params[0][0] === 'multipart/alternative') {
        html = get_html_from_multipart_alternative(body);
    } else if(body.params[0][0] === 'multipart/mixed') {
        _.each(body.parts, function(part) {
            if(part.is_multipart && part.params[0][0] === 'multipart/alternative') {
                html = get_html_from_multipart_alternative(part);
            }
        });
    }

    return html;
}

function get_html_from_multipart_alternative(part) {
    _.each(part.parts, function(subpart) {
        if(!subpart.is_multipart && subpart.content_type === 'text/html') {
            html = subpart.content;
        } else if(subpart.is_multipart && subpart.params[0][0] === 'multipart/related') {
            _.each(subpart.parts, function(subpart2) {
                if(!subpart2.is_multipart && subpart2.content_type === 'text/html') {
                    html = subpart2.content;
                }
            });
        }
    });

    return html;
}

// In-place editing /////////////////////////////////////////////////

// Returns an event_map key for attaching "ok/cancel" events to
// a text input (given by selector)
var okcancel_events = function (selector) {
    return 'keyup '+selector+', keydown '+selector+', focusout '+selector;
};

// Creates an event handler for interpreting "escape", "return", and "blur"
// on a text field and calling "ok" or "cancel" callbacks.
var make_okcancel_handler = function(options) {
    var ok = options.ok || function() {};
    var cancel = options.cancel || function() {};

    return function(evt) {
        if(evt.type === "keydown" && evt.which === 27) {
            // escape = cancel
            cancel.call(this, evt);

        } else if(evt.type === "keyup" && evt.which === 13 ||
                  evt.type === "focusout") {
            // blur/return/enter = ok/submit if non-empty
            var value = String(evt.target.value || "");
            if(value) {
                ok.call(this, value, evt);
            } else {
                cancel.call(this, evt);
            }
        };
    };
};

// Finds a text input in the DOM by id and focuses it.
var focus_field_by_id = function(id) {
    var input = document.getElementById(id);
    if(input) {
        input.focus();
        input.select();
    }
};



