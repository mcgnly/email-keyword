// what's the deal with the caps and non-caps?
Keywordcollection = new Mongo.Collection('keywordcollection');

Keywordcollection.allow({
    insert: function(userId, doc){
        return false;
    },
    update: function(userId, doc, fields, modifier) {
        return false;
    },
    remove: function (userId, doc){
        return false;
    }
});

if (Meteor.isClient) {

	console.log('Clients rock, servers suck')

	Template.body.helpers({
		allKeywords: function() {
			return Keywordcollection.find().fetch();
		}, 
		myCity: function(adjective){
			var city =""
			if (Math.random()<0.5) {
				city ="Berlin";
			}
			else {
				city= "dublin";
			}
			return city + " is " + adjective;
		}



// hardcode the object:
		// keywordobject: [
		// 	{ keywordtext: "abc"}, 
		// 	{ keywordtext: "def"}, 
		// 	{ keywordtext: "ghi"}, 
		// ]
	});

	Template.keywordtemplate.helpers({
		status: function(){
			if (this.checked) {
				return "checked";
			}
			else {
				return "not checked";
			}
			
		}
	});
// why plural events?
	Template.body.events({
		'submit .new-email': function(event) {
			var thisemail = event.target.email.value;
			var thiskeyword = event.target.keyword.value;
			
			Meteor.call('addKeyword', thisemail, thiskeyword)

			event.target.email.value = "";
			return false;
		}
	});

	Template.keywordtemplate.events({
		'click .toggle-checked': function() {
			 //update the thing in the collection whose _id you got via this, and an OBJECT hence{}
			// Keywordcollection.update(this._id, {$set: {checked: !this.checked}}) //why $??
			Meteor.call('changeChecked',!this.checked, this._id)
		}, //comma bc it's items in an object!
		'click .delete': function() {
			Meteor.call('allowDelete',this._id)
		}
	});
	
}

if (Meteor.isServer) {

	console.log('Clients suck, servers rock')

	Meteor.methods({
		'addKeyword': function (email, keyword) {
			Keywordcollection.insert({
				email: email,
				createdAt: new Date(),
				keyword: keyword
			})
		},
		'changeChecked': function (serverChecked, _id) {
			Keywordcollection.update(_id, {$set: {checked: serverChecked}})
		}, 
		'allowDelete' : function (_id){
			Keywordcollection.remove(_id);
		}
	})

}