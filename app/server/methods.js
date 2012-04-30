var require = __meteor_bootstrap__.require,
    nodemailer = require('nodemailer');

var mailer = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");

Meteor.methods({
    sendmail: function(mail) {
        mailer.sendMail(mail,
            function(err, result) {
                if(err) { 
                    console.log(err); 
                }
            });
    },
});
