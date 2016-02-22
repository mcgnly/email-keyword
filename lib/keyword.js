// keywords = new Mongo.Collection('keywords')

// what's the deal with the caps and non-caps?
KeywordCollection = new Mongo.Collection('keywordCollection');

//disallow the client side from doing anything directly
KeywordCollection.allow({
    insert: function(userId, doc){
        return false;
    },
    update: function(userId, doc, fields, modifier) {
        return false;
    },
    remove: function (userId, doc){
        return false;
    }
});