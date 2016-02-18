// function addEmail(email, keyword) {
// 	console.log('adding email', email, 'with keyword', keyword);

// // keywords plural is the name of the collection, keyword singular is the parameter given by the user
// 	existingKeyword = keywords.findOne({
// 		// first keyword : "fridge", second is the user input
// 		keyword: keyword
// 	});

// 	// if the keyword input by the user matches nothing in the collection
// 	if(!existingKeyword) {
// 		keywords.insert({
// 			emails: [email],
// 			keyword: keyword
// 		});
// 	} else {
// 		if( ! _.find(existingKeyword.emails, function(keywordEmail) {
// 			return keywordEmail === email;
// 		})) {
// 			existingKeyword.emails.push(email)

// 			keywords.update(existingKeyword._id, {
// 				$set: {
// 					emails: existingKeyword.emails
// 				}
// 			})
// 		}
// 	}

// 	console.log(keywords.find().fetch().length);

// 	allKeywords = keywords.find().fetch();

// 	for(var i = 0; i < allKeywords.length; i++) {
// 		console.log('keyword', allKeywords[i].keyword, 'emails', allKeywords[i].emails)
// 	}
// }

// function testUI() {
// 	addEmail('foschi.enrico@gmail.com', 'fridge');
// 	addEmail('katie@gmail.com', 'fridge');
// 	addEmail('katie@gmail.com', 'squirrel');

// }

// Meteor.startup(testUI)