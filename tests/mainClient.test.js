describe('submitting email to server', function() {
    it('should not accept a blank email', function() {
       let email = '';
       expect(addKeyword).to.not.have.been.called;
    })

    it('should not accept a blank city', function() {
       let keyword = '';
       expect(addKeyword).to.not.have.been.called;
    })

    it('should not accept an email without an @', function() {
       let email = 'katieatmcgnly.com';
       expect(addKeyword).to.not.have.been.called;
    })

    it('should not accept an email without a .', function() {
       let email = 'katie@mcgnlydotcom';
       expect(addKeyword).to.not.have.been.called;
    })

    it('should not accept a city with a space', function() {
       let keyword = 'San Fransisco';
       expect(addKeyword).to.not.have.been.called;
    })

    it('should not accept a city with punctuation', function() {
       let keyword = 'pittsburgh, pa';
       expect(addKeyword).to.not.have.been.called;
    })

    it('should accept and pass through a properly formatted city and email', function() {
       let keyword = 'pittsburgh';
       let email = 'katie@mcgnly.com'
       expect(addKeyword).to.have.been.called.using(email, keyword);
    })    
})