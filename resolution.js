Resolutions = new Mongo.Collection("resolutions");
if (Meteor.isClient) {
  Meteor.subscribe("resolutions");
  Template.body.helpers({
    resolutions: function() {
      if (Session.get('hideFinished')){
        return Resolutions.find({checked: {$ne: true}});
      }
      else {
        return Resolutions.find();  
      }
    }
  });

  Template.body.events({
    'submit .new-resolution': function(event){
      event.preventDefault();
      var title = event.target.title.value;
      Meteor.call('addResolution', title);
      event.target.title.value = "";
    },

    'change .hide-finished': function(event){
      Session.set('hideFinished', event.target.checked);
    }
  });

  Template.resolution.events({
    "click .delete": function() {
      Meteor.call('deleteResolution', this._id)
    },

    "click .toggle-checked": function() {
      Meteor.call('updateResolution', this._id, !this.checked);
    },

    "click .toggle-private": function() {
      Meteor.call('setPrivate', this._id, !this.private);
    }
  });

  Template.resolution.helpers({
    isOwner : function() {
      return this.owner === Meteor.userId();
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}



if (Meteor.isServer) {
  Meteor.startup(function () {
    
  });

  Meteor.publish("resolutions", function() {
    return Resolutions.find({
      $or: [
        {private: {$ne: true}}, 
        {owner: this.userId}
      ]
    });
  });
}

Meteor.methods({
  addResolution : function(title) {
    Resolutions.insert({
      title: title,
      createdAt: new Date(),
      owner: Meteor.userId()
    });
  },

  updateResolution : function(id, checked) {
    var res = Resolutions.findOne(id);
    if (res.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Resolutions.update(id, {$set: {checked: checked}});
  },

  deleteResolution : function(id) {
    var res = Resolutions.findOne(id);
    if (res.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Resolutions.remove(id);
  },

  setPrivate : function(id, private) {
    var res = Resolutions.findOne(id);
    if (res.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Resolutions.update(id, {$set: {private: private}});
  }
});