    if (Meteor.isServer) {

        console.log('Clients suck, servers rock')

        var consumer_key1 = Meteor.settings.CONSUMER_KEY;
        var consumer_secret1 = Meteor.settings.CONSUMER_SECRET;
        var access_token1 = Meteor.settings.ACCESS_TOKEN;
        var access_token_secret1 = Meteor.settings.ACCESS_TOKEN_SECRET;
        var mailgun_key = Meteor.settings.MAILGUN_KEY;

        var Twit = Meteor.npmRequire('twit');

        // var later = require('later');

        // SyncedCron.add({ 
        //     name: 'check AFP Twitter',
        //     schedule: function(parser) {
        //         // parser is a later.parse object
        //         return parser.text('every 8 hours');
        //     },
        //     job: function() {
        //         Meteor.call('twitterChecker');
        //     }
        // });
        Meteor.methods({
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
                        KeywordCollection.update(existingKeyword._id, {
                            $push: {
                                emails: email
                            }
                        });
                    }
                }
                //if it doesn't...
                else {
                    //add an entry in the collection
                    KeywordCollection.insert({
                        emails: [email],
                        keyword: keyword
                    });
                }
            }, //again, items in an object, hence the ,

            'changeChecked': function(serverChecked, id) {
                //update the thing in the collection whose id you got passed to you in the fn call, and an OBJECT hence{}
                KeywordCollection.update(id, {
                    $set: {
                        checked: serverChecked
                    }
                }) //the $ thing is mongodb not jquery
            },

            'allowDelete': function(id) {
                KeywordCollection.remove(id);
            },

            'sendEmail': function(email) {
                console.log("started sendemail");
                console.log(email);
                Email.send({
                    to: email,
                    from: 'mailgun@.mcgnly.com',
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
                console.log("top of fn: " + abc.tweetId);
                var T = new Twit({
                    consumer_key: Meteor.settings.CONSUMER_KEY,
                    consumer_secret: consumer_secret1,
                    access_token: access_token1,
                    access_token_secret: access_token_secret1
                });

                // Construct the API URL and query the API
                lastTweets = T.get('statuses/user_timeline', {
                    screen_name: 'amandapalmer',
                    since_id: (LastTweetsCollection.findOne({}, {
                        sort: {
                            createdAt: -1
                        }
                    }) || {}).tweetId,
                    // since_id: abc.tweetId,
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
                            // KeywordCollection.update(tweetId._id, {
                            //         $set: {
                            //             tweetId: result.data[0].id_str;
                            //         }
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
            }
        });

        Meteor.startup(function() {});
        // SyncedCron.start();
    }