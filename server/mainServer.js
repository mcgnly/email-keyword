    if (Meteor.isServer) {

        console.log('Clients suck, servers rock')

        var Twit = Meteor.npmRequire("twit");
        // let twitSettings = Meteor.settings.private.twitter,
        T = new Twit({
            consumer_key: Meteor.settings.private.twitter.CONSUMER_KEY,
            consumer_secret: Meteor.settings.private.twitter.CONSUMER_SECRET,
            access_token: Meteor.settings.private.twitter.ACCESS_TOKEN,
            access_token_secret: Meteor.settings.private.twitter.ACCESS_TOKEN_SECRET
        });

        let mgSettings = Meteor.settings.private.mailgun;
        mg = new Mailgun({
            apiKey: Meteor.settings.private.mailgun.MAILGUN_KEY,
            domain: Meteor.settings.private.mailgun.domain
        })

        SyncedCron.start();

        Meteor.methods({

            'allowDelete': function(id) {
                KeywordCollection.remove(id);
            },

            'sendEmail': function(email) {
                Email.send({
                    to: email,
                    sender: 'postmaster@mcgnly.com',
                    from: 'postmaster@.mcgnly.com',
                    subject: 'Testing testing',
                    text: 'did it work?'
                });
                console.log("email sent")
            },

            'foaas': function(to, from) {
                var apiUrl = "http://www.foaas.com/donut/" + to + "/" + from;
                var options = {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
                var response = HTTP.get(apiUrl, options)
                return response;
            },

            'twitterChecker': function() {
                // Construct the API URL and query the API
                lastTweets = T.get('statuses/user_timeline', {
                    screen_name: 'mcgnly',
                    // since_id: 735184012562436096,
                    since_id: (LastTweetsCollection.findOne({}, {
                        sort: {
                            createdAt: -1
                        }
                    }) || {}).tweetId,
                    trim_user: true,
                    include_entities: false,
                    include_rts: false
                })

                .catch(function(err) {
                    console.log('caught error', err.stack)
                })
                    .then(Meteor.bindEnvironment(function(result) {
                        // `result` is an Object with keys "data" and "resp".
                        // `data` and `resp` are the same objects as the ones passed
                        // to the callback.
                        // See https://github.com/ttezel/twit#tgetpath-params-callback
                        // for details.
                        if (result.data.length > 0) {
                            for (d in result.data) {

                                var tweet = result.data[d].text;

                                console.log(tweet);
                                Meteor.call('tweetParser', tweet)
                            }

                            LastTweetsCollection.insert({
                                tweetId: result.data[0].id_str,
                                createdAt: new Date()
                            })
                        } else {
                            console.log("nothing new to report");
                        }
                    }))
            },

            'tweetParser': function(tweet) {
                var splitTweet = tweet.split(" ");
                // console.log(splitTweet);

                for (i = 0; i < splitTweet.length; i++) {
                    twitterTrigger = KeywordCollection.findOne({
                        keyword: splitTweet[i]
                    });
                    //this returns an object which will be true if it exists
                    //if it DOES exist already...
                    if (twitterTrigger) {
                        console.log("got to twittertrigger");
                        _.each(twitterTrigger.emails, function(email) {
                            Meteor.call('sendEmail', email);
                        });
                    }
                }
            },

            'addKeyword': function(email, keyword) {
                //returns true if the keyword given in the form matches something in the collection
                existingKeyword = KeywordCollection.findOne({
                    keyword: keyword
                });
                //this returns an object which will be true if it exists
                //if it DOES exist already...
                if (existingKeyword) { //returns true...
                    //console.log("this keyword exists already in: "+existingKeyword);
                    //check that the new email isn't already in the list of existing emails
                    if (!_.find(existingKeyword.emails, function(existingEmail) {
                        return existingEmail === email;
                    })) {
                        //and puch the new email into the existing list
                        KeywordCollection.update(existingKeyword._id, {
                            $push: {
                                emails: email
                            }
                        });
                    }
                }
                //if the keyword doesn't exist already...
                else {
                    //add an entry in the collection
                    KeywordCollection.insert({
                        emails: [email],
                        keyword: keyword
                    });
                }
            }
        });

        Meteor.startup(function() {});
        // SyncedCron.start();
    }