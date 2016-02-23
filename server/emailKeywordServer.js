if (Meteor.isServer) {

	console.log('Clients suck, servers rock')

	var consumer_key=  Meteor.settings.CONSUMER_KEY;
	var consumer_secret= Meteor.settings.CONSUMER_SECRET; 
	var access_token= Meteor.settings.ACCESS_TOKEN; 
	var access_token_secret= Meteor.settings.ACCESS_TOKEN_SECRET;
	
	var Twit = Meteor.npmRequire('twit')

	var T = new Twit({
		consumer_key,
		consumer_secret,
		access_token,
		access_token_secret,
	});

	Meteor.methods({
		'addKeyword': function (email, keyword) {
			//returns true if the keyword given in the form matches something in the collection
			existingKeyword = KeywordCollection.findOne({
				keyword: keyword
			});
			//if it DOES exist already...
			if (existingKeyword){
				//something happens
			}
			//if it doesn't...
			else {
				KeywordCollection.insert({
					email: [email],
					//createdAt: new Date(),
					keyword: keyword
				})
			}
		}, //again, items in an object, hence the ,
		'changeChecked': function (serverChecked, id) {
			//update the thing in the collection whose id you got passed to you in the fn call, and an OBJECT hence{}
			KeywordCollection.update(id, {$set: {checked: serverChecked}}) //the $ thing is mongodb not jquery
		}, 
		'allowDelete' : function (id){
			KeywordCollection.remove(id);
		}
	});



Meteor.startup(function () {
	lastTweets = T.get('statuses/user_timeline/tweets', { screen_name: "amandapalmer", 
													  since_id: 701556146952220672,
                                                      exclude_replies: "true", 
                                                      include_rts: "false"}, 
              function (err, data, response) {console.log(data)});


});

}
