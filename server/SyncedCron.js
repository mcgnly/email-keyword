SyncedCron.add({
    name: 'check that twitter',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 15 minutes');
        // let time = new Date(Date.now() + 6000);
        // return parser.recur().on(time).fullDate();
    },
    job: function() {
        Meteor.call('twitterChecker');
    }
});