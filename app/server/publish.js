Mails = new Meteor.Collection("mails");

Meteor.publish('mails', function () {
  return Mails.find();
});


