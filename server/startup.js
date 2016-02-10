function addEmail(email, keyword) {
	console.log('adding email', email, 'with keyword', keyword);

	existingKeyword = keywords.findOne({
		keyword: keyword
	});

	if(!existingKeyword) {
		keywords.insert({
			emails: [email],
			keyword: keyword
		});
	} else {
		if( ! _.find(existingKeyword.emails, function(keywordEmail) {
			return keywordEmail === email;
		})) {
			existingKeyword.emails.push(email)

			keywords.update(existingKeyword._id, {
				$set: {
					emails: existingKeyword.emails
				}
			})
		}
	}

	console.log(keywords.find().fetch().length);

	allKeywords = keywords.find().fetch();

	for(var i = 0; i < allKeywords.length; i++) {
		console.log('keyword', allKeywords[i].keyword, 'emails', allKeywords[i].emails)
	}
}

function testUI() {
	addEmail('foschi.enrico@gmail.com', 'fridge');
	addEmail('katie@gmail.com', 'fridge');
	addEmail('katie@gmail.com', 'squirrel');

}

Meteor.startup(testUI)