if (Meteor.isClient) {

  console.log('Clients rock, servers suck')
  Template.body.helpers({
    // hardcode the object:
    // keywordobject: [
    // 	{ keywordtext: "abc"}, 
    // 	{ keywordtext: "def"}, 
    // 	{ keywordtext: "ghi"}, 
    // ]
    allKeywords: function() {
      //the fetch is just for appearances here, find would have gotten a cursor and got the job done too
      return KeywordCollection.find().fetch();
    }
  });

  Template.realThing.events({
    'submit .new-email': function(event) { //event holds the info fron the forms
      var thisemail = event.target.email.value;
      var thiskeyword = event.target.keyword.value;
      //call the server mthd bc client isn't allowed to DO shit
      // Meteor.call('addToMailingList', thisemail, (error) => {
      //   if (error) {
      //     console.log(error.reason);
      //   }
      // });
      Meteor.call('addKeyword', thisemail, thiskeyword)
      //clear out the form box and false to stop an unnecessary refresh
      event.target.email.value = "";
      event.target.keyword.value = "";
      // toastr.success("thanks!", "your email was successfully added to our database!");

      return false;
    },

    'click .twitterChecker': function(event) {
      Meteor.call('twitterChecker', function(error, result) {
        if (error) {
          console.log('SERVER ERRR');
          console.log(error);
        } else {
          console.log("checked twitter");
        }

      });
    }

  });

  Template.keywordTemplate.helpers({
    // 'tweetText': function () {
    // 	Meteor.call('tweetText')
    // } 
  });

}

Router.route('/about', {
  name: 'about',
  template: 'about'
});
Router.route('/', {
  name: 'home',
  template: 'home'
});
Router.configure({
  layoutTemplate: 'main'
});