if (Meteor.isClient) {

	console.log('Clients rock, servers suck')

	Template.body.helpers({
		// hardcode the object:
		// keywordobject: [
		// 	{ keywordtext: "abc"}, 
		// 	{ keywordtext: "def"}, 
		// ]
		allKeywords: function() {
			//the fetch is just for appearances here, find would have gotten a cursor and got the job done too
			return KeywordCollection.find().fetch();
			}

		
		
	});

	Template.body.events({
		'submit .new-email': function(event) { //event holds the info fron the forms
			var thisemail = event.target.email.value;
			var thiskeyword = event.target.keyword.value;
			//call the server mthd bc client isn't allowed to DO shit
			Meteor.call('addKeyword', thisemail, thiskeyword)
			//clear out the form box and false to stop an unnecessary refresh
			event.target.email.value = "";
			event.target.keyword.value = "";
			return false;
		}
	});

	Template.keywordTemplate.helpers({
		// status: function(){
		// 	if (this.checked) {
		// 		return "checked";
		// 	}
		// 	else {
		// 		return "not checked";
		// 	}
		// }
	});

	Template.keywordTemplate.events({ //this is holding an object of a bunch of "k/val pairs", hence {} and ,s
		'click .toggle-checked': function() { //when the toggle-checked class in html is clicked (aka the key), do the fn (the value in the pair)
			Meteor.call('changeChecked',!this.checked, this._id) //send over the opposite of the checkedness, and the _id
		}, //comma bc it's items in an object!
		'click .delete': function() {
			Meteor.call('allowDelete',this._id)
		}
	});
	
	// Meteor.call('tweetText', function(err,res){ 
 //  			console.log(res);
	// 	});
}

