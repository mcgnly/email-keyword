if (Meteor.isServer) {

	console.log('Clients suck, servers rock')

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

var Twit = Meteor.npmRequire('twit')

var T = new Twit({
  consumer_key:  keys.CONSUMER_KEY,
  consumer_secret: keys.CONSUMER_SECRET,
  access_token_key: keys.ACCESS_TOKEN,
  access_token_secret: keys.ACCESS_TOKEN_SECRET
});

lastTweets = T.get('statuses/user_timeline/tweets', { screen_name: "amandapalmer", 
													  since_id: 701556146952220672,
                                                      exclude_replies: "true", 
                                                      include_rts: "false"}, 
              function (err, data, response) {console.log(data)});


}

