if (Meteor.isServer) {

	console.log('Clients suck, servers rock')

	// var consumer_key1=  Meteor.settings.CONSUMER_KEY;
	// var consumer_secret1= Meteor.settings.CONSUMER_SECRET; 
	// var access_token1= Meteor.settings.ACCESS_TOKEN; 
	// var access_token_secret1= Meteor.settings.ACCESS_TOKEN_SECRET;

	// var Twit = Meteor.npmRequire('twit');

	// var T = new Twit({
	// 	consumer_key: consumer_key1,
	// 	consumer_secret: consumer_secret1,
	// 	access_token: access_token1,
	// 	access_token_secret: access_token_secret1
	// });

	Meteor.methods({
		'addKeyword': function (email, keyword) {
			//returns true if the keyword given in the form matches something in the collection
			existingKeyword = KeywordCollection.findOne({
				keyword: keyword
			});
			console.log(existingKeyword);//this returns an object which will be true if it exists
			//if it DOES exist already...
			if (existingKeyword){ //returns true...
				//check that the new email isn't already in the list of existing emails
				if( ! _.find(existingKeyword.emails, email)){ 
					//make an object (or an array??) with the emails already assigned to it, push new email in
					var existingEmails = existingKeyword.emails.push(email);		
					//replace old email list with new one
					KeywordCollection.update(existingKeyword._id, {$set: {emails: existingEmails}});
				}
			}
			//if it doesn't...
			else {
				KeywordCollection.insert({
					emails: [email],
					//createdAt: new Date(),
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
		}//,

		  // The method expects a valid IPv4 address
	  	// 'tweetText': function () {
	   //  	//console.log('Method.geoJsonForIp for', ip);
	   //  	// Construct the API URL and query the API
	   //  	lastTweets = T.get('statuses/user_timeline/tweets', {screen_name:'amandapalmer', since_id: 702331206575099904}, 
	   //  		function (err, data, response) {console.log(data)});
	   //  	// 
	   //  	// return lastTweets;
	  	// }

	});



 Meteor.startup(function () {
// 	lastTweets = T.get('statuses/user_timeline/tweets', { screen_name: "amandapalmer", 
// 													  since_id: 701556146952220672,
//                                                       exclude_replies: "true", 
//                                                       include_rts: "false"}, 
//               function (err, data, response) {console.log(data)});


});

}
