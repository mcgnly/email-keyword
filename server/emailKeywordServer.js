if (Meteor.isServer) {

	console.log('Clients suck, servers rock')

	var consumer_key1=  Meteor.settings.CONSUMER_KEY;
	var consumer_secret1= Meteor.settings.CONSUMER_SECRET; 
	var access_token1= Meteor.settings.ACCESS_TOKEN; 
	var access_token_secret1= Meteor.settings.ACCESS_TOKEN_SECRET;
	var mailgun_key = Meteor.settings.MAILGUN_KEY;

	var Twit = Meteor.npmRequire('twit');

	

	Meteor.methods({
		'addKeyword': function (email, keyword) {
			//returns true if the keyword given in the form matches something in the collection
			existingKeyword = KeywordCollection.findOne({
				keyword: keyword
			});
			//this returns an object which will be true if it exists
			//if it DOES exist already...
			if (existingKeyword){ //returns true...
			console.log("this keyword exists already in: "+existingKeyword);

				//check that the new email isn't already in the list of existing emails
				if( ! _.find(existingKeyword.emails, function(existingEmail){return existingEmail === email;})) 
				{ 
					KeywordCollection.update(existingKeyword._id, {$push: {emails: email}});
				}
			}
			//if it doesn't...
			else {
				KeywordCollection.insert({
					emails: [email],
					keyword: keyword
				});
			}
		}, //again, items in an object, hence the ,

		'changeChecked': function (serverChecked, id) {
			//update the thing in the collection whose id you got passed to you in the fn call, and an OBJECT hence{}
			KeywordCollection.update(id, {$set: {checked: serverChecked}}) //the $ thing is mongodb not jquery
		}, 

		'allowDelete' : function (id){
			KeywordCollection.remove(id);
		},

		'sendEmail' : function(email){
			Email.send({
				to:email, 
				from:'keywordchecker@mcgnly.com', 
				subject:'Testing testing', 
				text:'did it work?'
			});
			console.log("email sent")

		},

	  	'foaas' : function(to, from){
			var apiUrl = "http://www.foaas.com/donut/"+to +"/"+from;
			var options = {
        		headers: {'Accept': 'application/json'}
      		}
    		var response = HTTP.get(apiUrl, options)
    		return response;	
		},

 		'twitterChecker': function(){
 	 	// var T = new Twit({
				// 	consumer_key: consumer_key1,
				// 	consumer_secret: consumer_secret1,
				// 	access_token: access_token1,
				// 	access_token_secret: access_token_secret1
				// });
	   //  	// console.log('unicorns');
	   //  	// Construct the API URL and query the API
	   //  lastTweets = T.get('statuses/user_timeline', 
	   //  		{screen_name:'amandapalmer',
	   //  		since_id: 703071471149543424, 
	   //  		include_rts : false,
	   //  		trim_user : true}, 
	   //  		function (err, data, response) {
	   //  			return(data)});
		return ("pretend this is a tweet")
		},

		'tweetParser': function(){
		//for each keyword in collection:
		//see if tweet msg string contains held keyword
			//if yes, loop through each email and invoke email method
		}

	});

	Meteor.startup(function () {
	});

}
