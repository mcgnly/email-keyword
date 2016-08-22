if (Meteor.isServer) {

    console.log('Clients suck, servers rock')

    var Twit = Meteor.npmRequire("twit");
    // let twitSettings = Meteor.settings.private.twitter,
    T = new Twit({
        consumer_key: Meteor.settings.twitter.CONSUMER_KEY,
        consumer_secret: Meteor.settings.twitter.CONSUMER_SECRET,
        access_token: Meteor.settings.twitter.ACCESS_TOKEN,
        access_token_secret: Meteor.settings.twitter.ACCESS_TOKEN_SECRET
    });

    let mgSettings = Meteor.settings.mailgun;
    mg = new Mailgun({
        apiKey: Meteor.settings.mailgun.MAILGUN_KEY,
        domain: Meteor.settings.mailgun.domain
    })

    SyncedCron.start();

    Meteor.methods({

        'allowDelete': function(id) {
            KeywordCollection.remove(id);
        },

        'sendEmail': function(email, keyword, tweet) {
            //first process the unsubscribes so nobody gets bothered, and async blocked so nobody gets emailed unless I can check unsubscrubes first
            checkUnsubscribes().then(() => {
                // 
                //eventually I'd like to embed the tweet itself in the email
                // let embedCall = HTTP.call("GET", "https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2Famandapalmer%2Fstatus%2F" + tweetId);
                // let embedText = embedCall.html;
                // consolelog(embedText);
                // GET
                //
                Email.send({
                    to: email,
                    mail_from: 'postmaster@.mcgnly.com',
                    // sender: 'postmaster@mcgnly.com',
                    from: Meteor.settings.mailgun.from,
                    subject: 'AFP Alert',
                    text: 'You have received this email because you were looking for the town ' + keyword.keyword + 
                    ". The text of the tweet which triggered this email is: \n"+ tweet
                });
                console.log('sent a triggered email');
            });
        },

        'twitterChecker': function() {
            // Construct the API URL and query the API
            lastTweets = T.get('statuses/user_timeline', {
                screen_name: 'amandapalmer',
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
                            var tweetId = result.data[d].id;
                            console.log(tweet);
                            Meteor.call('tweetParser', tweet, tweetId)
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

        'tweetParser': function(tweet, tweetId) {
            var splitTweet = tweet.split(/[\s||.||!||\/]+/);

            for (i = 0; i < splitTweet.length; i++) {
                twitterTrigger = KeywordCollection.findOne({
                    keyword: splitTweet[i].toLowerCase()
                });
                //this returns an object which will be true if it exists
                //if it DOES exist already...
                if (twitterTrigger) {
                    _.each(twitterTrigger.emails, function(email) {
                        Meteor.call('sendEmail', email, twitterTrigger, tweet);
                    });
                }
            }
        },

        'deleteUnsubscribes': function(email) {
            //for each keyword,
            console.log("this email should be deleted", email);
            KeywordCollection.update({}, {
                $pull: {
                    emails: email
                }
            }, {
                multi: true
            });
        },

        'addKeyword': function(email, keyword) {
            if (!(email || keyword)) {
                throw new Error('Provide an email and a keyword');
            } else {
                console.log("email", email);
                console.log("keyword", keyword);

                // async block the addition of the email address to the database until I'm sure a confirmation email has been sent
                confirmEmail(email).then(() => {
                    console.log('added new keyword');
                    //returns true if the keyword given in the form matches something in the collection
                    existingKeyword = KeywordCollection.findOne({
                        keyword: keyword
                    });
                    //this returns an object which will be true if it exists
                    //if it DOES exist already...
                    if (existingKeyword) { //returns true...
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
                            keyword: keyword.toLowerCase()
                        });
                    }
                });
            }

        }
    });

    let checkUnsubscribes = () => {
        return new Promise((resolve, reject) => {
            HTTP.call("GET", "https://api.mailgun.net/v3/mcgnly.com/unsubscribes", {
                    auth: 'api:' + Meteor.settings.mailgun.MAILGUN_KEY
                },
                function(error, result) {
                    if (!error) {
                        let unsubscribes = JSON.parse(result.content).items; //this is an array
                        let newUnsubscribes = unsubscribes
                            //create a collection of the unsubscribed email addresses
                        unsubscribes.forEach((x) => {
                            UnsubscribersCollection.insert({
                                email: x.address,
                                createdAt: new Date()
                            })
                            Meteor.call('deleteUnsubscribes', x.address);
                            HTTP.call("DELETE", "https://api.mailgun.net/v3/mcgnly.com/unsubscribes/" + x.address, {
                                auth: 'api:' + Meteor.settings.mailgun.MAILGUN_KEY
                            });
                        });
                        resolve();
                    } else {
                        console.log(error);
                        reject();
                    }
                });
        });
    }

    let confirmEmail = (email) => {
        return new Promise((resolve, reject) => {
            console.log('sent confirmation email');
            Email.send({
                to: email,
                mail_from: 'postmaster@.mcgnly.com',
                // sender: 'postmaster@mcgnly.com',
                from: Meteor.settings.mailgun.from,
                subject: 'AFP Alert signup confirmation',
                text: 'You have received this email because you were signed up for the AFP-Alert website, alerting you when Amanda Palmer tweets about your chosen city. If you would no longer like to recieve these alerts, please use the unsubscribe link at the bottom of each email (including this one), and you will be removed from our list of subscribers. Thanks, and have a great day!'
            });
            resolve();
        });
    }


    Meteor.startup(function() {
        process.env.MAIL_URL = Meteor.settings.MAIL_URL;
    });
}